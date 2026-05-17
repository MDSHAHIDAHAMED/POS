import "dotenv/config";
import express from "express";
import crypto from "crypto";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const sessions = new Map<string, string>();

function mapRoleName(name: string) {
  const map: Record<string, string> = {
    "Super Admin": "super_admin",
    Admin: "admin",
    Manager: "manager",
    Cashier: "cashier",
    Accountant: "accountant",
    "Store Keeper": "store_keeper",
  };
  return map[name] || "cashier";
}

function mapAuthUser(user: any) {
  return {
    uid: user.id,
    email: user.email,
    displayName: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`,
    role: mapRoleName(user.role?.name || "Cashier"),
    status: user.status === "ACTIVE" ? "active" : "inactive",
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

const LOW_STOCK_THRESHOLD = 15;
const TAX_RATE = 0.05;

function num(v: Prisma.Decimal | number | null | undefined) {
  return Number(v ?? 0);
}

function mapProduct(p: any) {
  const stock = (p.inventories || []).reduce((s: number, i: any) => s + i.quantity, 0);
  return {
    ...p,
    purchasePrice: num(p.purchasePrice),
    salePrice: num(p.salePrice),
    wholesalePrice: p.wholesalePrice ? num(p.wholesalePrice) : null,
    taxRate: num(p.taxRate),
    discount: num(p.discount),
    stock,
    lowStock: stock > 0 && stock < LOW_STOCK_THRESHOLD,
  };
}

async function getDefaultWarehouse() {
  let wh = await prisma.warehouse.findFirst({ where: { isDefault: true } });
  if (!wh) wh = await prisma.warehouse.findFirst();
  if (!wh) throw new Error("No warehouse configured");
  return wh;
}

async function getSystemCashier() {
  let user = await prisma.user.findFirst({ where: { email: "admin@shop.com" } });
  if (!user) user = await prisma.user.findFirst();
  if (!user) throw new Error("No cashier user found. Run db:seed.");
  return user;
}

export const app = express();
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: "error", db: "disconnected", error: String(error) });
  }
});

// ── Auth ───────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
      include: { role: true },
    });
    if (!user || user.passwordHash !== password || user.status !== "ACTIVE") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, user.id);
    res.json({ token, user: mapAuthUser(user) });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: sessions.get(token)! },
      include: { role: true },
    });
    if (!user) {
      sessions.delete(token);
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ user: mapAuthUser(user) });
  } catch {
    res.status(500).json({ error: "Failed to verify session" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// ── Dashboard ──────────────────────────────────────────────
app.get("/api/dashboard/stats", async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [dailyAgg, monthlyAgg, totalProducts, inventories] = await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: { gte: today }, status: "COMPLETED" },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: monthStart }, status: "COMPLETED" },
        _sum: { total: true },
      }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.inventory.findMany({ include: { product: true } }),
    ]);

    const lowStockCount = inventories.filter((i) => i.quantity > 0 && i.quantity < LOW_STOCK_THRESHOLD).length;
    const expiringCount = inventories.filter((i) => {
      if (!i.expiryDate) return false;
      const diff = (i.expiryDate.getTime() - Date.now()) / 86400000;
      return diff >= 0 && diff <= 30;
    }).length;

    const monthlyRevenue = num(monthlyAgg._sum.total);
    res.json({
      dailySales: num(dailyAgg._sum.total),
      monthlyRevenue,
      profit: monthlyRevenue * 0.35,
      totalProducts,
      lowStockCount,
      expiringCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

app.get("/api/dashboard/revenue", async (_req, res) => {
  try {
    const days = 14;
    const data: { date: string; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const agg = await prisma.sale.aggregate({
        where: { createdAt: { gte: d, lt: next }, status: "COMPLETED" },
        _sum: { total: true },
      });
      data.push({
        date: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        revenue: num(agg._sum.total),
      });
    }
    res.json({ data });
  } catch {
    res.status(500).json({ error: "Failed to fetch revenue" });
  }
});

app.get("/api/dashboard/top-products", async (_req, res) => {
  try {
    const items = await prisma.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });
    const data = items.map((item, idx) => {
      const p = products.find((x) => x.id === item.productId);
      return {
        name: p?.name || "Unknown",
        imageUrl: p?.imageUrl || null,
        units: item._sum.quantity || 0,
        rank: idx + 1,
      };
    });
    res.json({ data });
  } catch {
    res.status(500).json({ error: "Failed to fetch top products" });
  }
});

app.get("/api/dashboard/recent-sales", async (_req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { cashier: true },
    });
    res.json({
      data: sales.map((s) => ({
        id: s.id,
        invoiceNo: s.invoiceNo,
        total: num(s.total),
        paymentMethod: s.paymentMethod,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        cashier: s.cashier,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch recent sales" });
  }
});

app.get("/api/dashboard/alerts", async (_req, res) => {
  try {
    const inventories = await prisma.inventory.findMany();
    const lowStock = inventories.filter((i) => i.quantity > 0 && i.quantity < LOW_STOCK_THRESHOLD).length;
    const expiring = inventories.filter((i) => {
      if (!i.expiryDate) return false;
      const diff = (i.expiryDate.getTime() - Date.now()) / 86400000;
      return diff >= 0 && diff <= 30;
    }).length;
    res.json({ lowStock, expiring });
  } catch {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// ── Categories ─────────────────────────────────────────────
app.get("/api/categories", async (_req, res) => {
  try {
    const data = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json({ data });
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ── Products ───────────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const { search, categoryId } = req.query;
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (categoryId && categoryId !== "all") where.categoryId = String(categoryId);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { sku: { contains: String(search), mode: "insensitive" } },
        { barcode: { contains: String(search), mode: "insensitive" } },
      ];
    }
    const products = await prisma.product.findMany({
      where,
      include: { category: true, brand: true, inventories: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: products.map(mapProduct) });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, sku, barcode, categoryId, purchasePrice, salePrice, wholesalePrice, taxRate, imageUrl, stock } = req.body;
    const warehouse = await getDefaultWarehouse();
    const product = await prisma.product.create({
      data: {
        name, sku, barcode, categoryId,
        purchasePrice, salePrice,
        wholesalePrice: wholesalePrice || null,
        taxRate: taxRate ?? 5,
        imageUrl,
        inventories: stock != null ? {
          create: { warehouseId: warehouse.id, quantity: Number(stock), batchNumber: "DEFAULT" },
        } : undefined,
      },
      include: { category: true, brand: true, inventories: true },
    });
    res.json({ success: true, data: mapProduct(product) });
  } catch (error) {
    res.status(400).json({ success: false, error: String(error) });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, sku, barcode, categoryId, purchasePrice, salePrice, wholesalePrice, taxRate, imageUrl, stock } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, sku, barcode, categoryId, purchasePrice, salePrice, wholesalePrice, taxRate, imageUrl },
      include: { category: true, brand: true, inventories: true },
    });
    if (stock != null) {
      const warehouse = await getDefaultWarehouse();
      await prisma.inventory.upsert({
        where: {
          productId_warehouseId_batchNumber: {
            productId: product.id,
            warehouseId: warehouse.id,
            batchNumber: "DEFAULT",
          },
        },
        update: { quantity: Number(stock) },
        create: { productId: product.id, warehouseId: warehouse.id, quantity: Number(stock), batchNumber: "DEFAULT" },
      });
    }
    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, brand: true, inventories: true },
    });
    res.json({ success: true, data: mapProduct(updated) });
  } catch (error) {
    res.status(400).json({ success: false, error: String(error) });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: String(error) });
  }
});

// ── Inventory ──────────────────────────────────────────────
app.get("/api/inventory/summary", async (_req, res) => {
  try {
    const inventories = await prisma.inventory.findMany();
    const totalUnits = inventories.reduce((s, i) => s + i.quantity, 0);
    const lowStock = inventories.filter((i) => i.quantity > 0 && i.quantity < LOW_STOCK_THRESHOLD).length;
    const expiring = inventories.filter((i) => {
      if (!i.expiryDate) return false;
      const diff = (i.expiryDate.getTime() - Date.now()) / 86400000;
      return diff >= 0 && diff <= 30;
    }).length;
    const totalSkus = await prisma.product.count({ where: { deletedAt: null } });
    res.json({ totalSkus, lowStock, expiring, totalUnits });
  } catch {
    res.status(500).json({ error: "Failed to fetch inventory summary" });
  }
});

app.get("/api/inventory/low-stock", async (_req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      where: { quantity: { lt: LOW_STOCK_THRESHOLD, gt: 0 } },
      include: { product: true },
    });
    res.json({
      data: inventories.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        sku: i.product.sku,
        stock: i.quantity,
        threshold: LOW_STOCK_THRESHOLD,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch low stock" });
  }
});

app.post("/api/inventory/movement", async (req, res) => {
  const { productId, quantity, type, note } = req.body;
  try {
    const warehouse = await getDefaultWarehouse();
    const inv = await prisma.inventory.findFirst({
      where: { productId, warehouseId: warehouse.id },
    });
    const current = inv?.quantity ?? 0;
    let newQty = current;
    if (type === "IN") newQty = current + Number(quantity);
    else if (type === "OUT") newQty = Math.max(0, current - Number(quantity));
    else if (type === "ADJUST") newQty = Number(quantity);

    await prisma.inventory.upsert({
      where: {
        productId_warehouseId_batchNumber: {
          productId,
          warehouseId: warehouse.id,
          batchNumber: inv?.batchNumber || "DEFAULT",
        },
      },
      update: { quantity: newQty },
      create: { productId, warehouseId: warehouse.id, quantity: newQty, batchNumber: "DEFAULT" },
    });
    res.json({ success: true, message: `Stock ${type} completed`, quantity: newQty, note });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ── Customers ──────────────────────────────────────────────
app.get("/api/customers", async (_req, res) => {
  try {
    const data = await prisma.customer.findMany({ orderBy: { name: "asc" } });
    res.json({
      data: data.map((c) => ({ ...c, walletBalance: num(c.walletBalance) })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { name, phone, email, address, loyaltyPoints, walletBalance } = req.body;
    const customer = await prisma.customer.create({
      data: { name, phone, email, address, loyaltyPoints: loyaltyPoints ?? 0, walletBalance: walletBalance ?? 0 },
    });
    res.json({ data: { ...customer, walletBalance: num(customer.walletBalance) } });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const { name, phone, email, address, loyaltyPoints, walletBalance } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, phone, email, address, loyaltyPoints, walletBalance },
    });
    res.json({ data: { ...customer, walletBalance: num(customer.walletBalance) } });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

// ── Suppliers ──────────────────────────────────────────────
app.get("/api/suppliers", async (_req, res) => {
  try {
    const data = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
    res.json({ data: data.map((s) => ({ ...s, balanceDue: num(s.balanceDue) })) });
  } catch {
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

app.post("/api/suppliers", async (req, res) => {
  try {
    const { name, phone, email, address, contactName } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, phone, email, address, contactName },
    });
    res.json({ data: { ...supplier, balanceDue: num(supplier.balanceDue) } });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.put("/api/suppliers/:id", async (req, res) => {
  try {
    const { name, phone, email, address, contactName } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: { name, phone, email, address, contactName },
    });
    res.json({ data: { ...supplier, balanceDue: num(supplier.balanceDue) } });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.delete("/api/suppliers/:id", async (req, res) => {
  try {
    await prisma.supplier.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

// ── Reports ────────────────────────────────────────────────
app.get("/api/reports/sales", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(String(startDate)) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(String(endDate)) : new Date();
    end.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end }, status: "COMPLETED" },
      orderBy: { createdAt: "asc" },
    });

    const totalRevenue = sales.reduce((s, sale) => s + num(sale.total), 0);
    const byDay: Record<string, number> = {};
    for (const sale of sales) {
      const key = sale.createdAt.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + num(sale.total);
    }
    const revenueByDay = Object.entries(byDay).map(([date, revenue]) => ({ date, revenue }));

    res.json({ totalSales: sales.length, totalRevenue, revenueByDay });
  } catch {
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// ── Sales ──────────────────────────────────────────────────
app.get("/api/sales", async (_req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { cashier: true, customer: true },
    });
    res.json({
      data: sales.map((s) => ({
        id: s.id,
        invoiceNo: s.invoiceNo,
        total: num(s.total),
        paymentMethod: s.paymentMethod,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        cashier: s.cashier,
        customer: s.customer,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

app.post("/api/sales/checkout", async (req, res) => {
  const { items, total, paymentMethod, customerId, discount = 0 } = req.body;
  try {
    const cashier = await getSystemCashier();
    const warehouse = await getDefaultWarehouse();
    const subTotal = Number(total);
    const taxAmount = subTotal * TAX_RATE;
    const grandTotal = subTotal + taxAmount - Number(discount);

    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          invoiceNo: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`,
          cashierId: cashier.id,
          customerId: customerId || null,
          subTotal,
          taxAmount,
          discount: Number(discount),
          total: grandTotal,
          paymentMethod: paymentMethod || "CASH",
          paymentStatus: "PAID",
          status: "COMPLETED",
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              subTotal: item.subtotal,
              tax: item.subtotal * TAX_RATE,
              discount: 0,
              total: item.subtotal * (1 + TAX_RATE),
            })),
          },
        },
        include: { items: true },
      });

      for (const item of items) {
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId, warehouseId: warehouse.id },
        });
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: Math.max(0, inv.quantity - item.quantity) },
          });
        }
      }

      await tx.transaction.create({
        data: { type: "INCOME", amount: grandTotal, description: `Sale ${created.invoiceNo}`, saleId: created.id },
      });

      return created;
    });

    res.json({ success: true, message: "Sale completed successfully", data: sale });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post("/api/print-receipt", (req, res) => {
  const { invoiceNo } = req.body;
  console.log(`[PRINTER] Printing receipt for ${invoiceNo || "New Sale"}...`);
  res.json({ success: true, message: "Receipt sent to thermal printer spooler" });
});
