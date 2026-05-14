import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const LOW_STOCK = 15;

const categories = [
  { name: "Groceries" },
  { name: "Beverages" },
  { name: "Electronics" },
  { name: "Fashion" },
  { name: "Snacks" },
  { name: "Household" },
];

const products = [
  { name: "Organic Apples 1kg", sku: "GRC-001", barcode: "8801001001", category: "Groceries", salePrice: 3.99, purchasePrice: 2.5, stock: 50, imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop" },
  { name: "Fresh Tomatoes 500g", sku: "GRC-002", barcode: "8801001002", category: "Groceries", salePrice: 2.49, purchasePrice: 1.2, stock: 35, imageUrl: "https://images.unsplash.com/photo-1546094097-3c3b5c7d5c8e?w=200&h=200&fit=crop" },
  { name: "Brown Rice 2kg", sku: "GRC-003", barcode: "8801001003", category: "Groceries", salePrice: 5.99, purchasePrice: 3.8, stock: 40, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop" },
  { name: "Olive Oil 500ml", sku: "GRC-005", barcode: "8801001005", category: "Groceries", salePrice: 8.99, purchasePrice: 5.5, stock: 8, imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop" },
  { name: "Cola 1.5L", sku: "BEV-001", barcode: "8802001001", category: "Beverages", salePrice: 1.99, purchasePrice: 0.9, stock: 120, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop" },
  { name: "Orange Juice 1L", sku: "BEV-002", barcode: "8802001002", category: "Beverages", salePrice: 3.49, purchasePrice: 1.8, stock: 60, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&fit=crop" },
  { name: "Wireless Headphones", sku: "ELC-001", barcode: "8803001001", category: "Electronics", salePrice: 79.99, purchasePrice: 45, stock: 25, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop" },
  { name: "Smart Watch Pro", sku: "ELC-002", barcode: "8803001002", category: "Electronics", salePrice: 199.99, purchasePrice: 120, stock: 12, imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop" },
  { name: "Power Bank 20000mAh", sku: "ELC-004", barcode: "8803001004", category: "Electronics", salePrice: 34.99, purchasePrice: 18, stock: 6, imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200&h=200&fit=crop" },
  { name: "Cotton T-Shirt", sku: "FAS-001", barcode: "8804001001", category: "Fashion", salePrice: 19.99, purchasePrice: 8, stock: 45, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop" },
  { name: "Potato Chips 150g", sku: "SNK-001", barcode: "8805001001", category: "Snacks", salePrice: 2.29, purchasePrice: 0.9, stock: 80, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop" },
  { name: "Dish Soap 500ml", sku: "HHD-001", barcode: "8806001001", category: "Household", salePrice: 4.49, purchasePrice: 2.1, stock: 55, imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=200&h=200&fit=crop" },
];

async function main() {
  const role = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: { name: "Super Admin", description: "Full system access" },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: "Manager" },
    update: {},
    create: { name: "Manager", description: "Store manager access" },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: "Cashier" },
    update: {},
    create: { name: "Cashier", description: "POS cashier access" },
  });

  const cashier = await prisma.user.upsert({
    where: { email: "admin@shop.com" },
    update: { passwordHash: "admin123" },
    create: {
      email: "admin@shop.com",
      passwordHash: "admin123",
      firstName: "Super",
      lastName: "Admin",
      roleId: role.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@shop.com" },
    update: { passwordHash: "manager123" },
    create: {
      email: "manager@shop.com",
      passwordHash: "manager123",
      firstName: "Store",
      lastName: "Manager",
      roleId: managerRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "cashier@shop.com" },
    update: { passwordHash: "cashier123" },
    create: {
      email: "cashier@shop.com",
      passwordHash: "cashier123",
      firstName: "POS",
      lastName: "Cashier",
      roleId: cashierRole.id,
    },
  });

  const warehouse = await prisma.warehouse.upsert({
    where: { id: "default-warehouse" },
    update: {},
    create: {
      id: "default-warehouse",
      name: "Main Warehouse",
      location: "Store Floor",
      isDefault: true,
    },
  });

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const existing = await prisma.category.findFirst({ where: { name: cat.name } });
    const record = existing ?? await prisma.category.create({ data: cat });
    categoryMap[cat.name] = record.id;
  }

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        salePrice: p.salePrice,
        purchasePrice: p.purchasePrice,
        imageUrl: p.imageUrl,
        categoryId: categoryMap[p.category],
      },
      create: {
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        salePrice: p.salePrice,
        purchasePrice: p.purchasePrice,
        taxRate: 5,
        imageUrl: p.imageUrl,
        categoryId: categoryMap[p.category],
      },
    });

    await prisma.inventory.upsert({
      where: {
        productId_warehouseId_batchNumber: {
          productId: product.id,
          warehouseId: warehouse.id,
          batchNumber: "DEFAULT",
        },
      },
      update: { quantity: p.stock },
      create: {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: p.stock,
        batchNumber: "DEFAULT",
      },
    });
  }

  const walkIn = await prisma.customer.upsert({
    where: { phone: "0000000000" },
    update: {},
    create: {
      name: "Walk-in Customer",
      phone: "0000000000",
      loyaltyPoints: 0,
      walletBalance: 0,
    },
  });

  const sampleCustomers = [
    { name: "Alice Johnson", phone: "555-0101", email: "alice@example.com", loyaltyPoints: 120, walletBalance: 25 },
    { name: "Bob Williams", phone: "555-0102", email: "bob@example.com", loyaltyPoints: 220, walletBalance: 50 },
    { name: "Carla Diaz", phone: "555-0103", email: "carla@example.com", loyaltyPoints: 80, walletBalance: 10 },
  ];
  for (const c of sampleCustomers) {
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: { name: c.name, email: c.email, loyaltyPoints: c.loyaltyPoints, walletBalance: c.walletBalance },
      create: c,
    });
  }

  const sampleSuppliers = [
    { name: "Global Foods Inc", phone: "555-1001", email: "orders@globalfoods.com", address: "Industrial Park 1", balanceDue: 1250 },
    { name: "TechZone Distributors", phone: "555-1002", email: "sales@techzone.com", address: "Tech Hub 5", balanceDue: 0 },
    { name: "Urban Apparel Co", phone: "555-1003", email: "contact@urbanapparel.com", address: "Fashion District 12", balanceDue: 540 },
  ];
  for (const s of sampleSuppliers) {
    const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!existing) await prisma.supplier.create({ data: s });
  }

  const productRecords = await prisma.product.findMany({ take: 3 });
  if (productRecords.length > 0) {
    const existingSales = await prisma.sale.count();
    if (existingSales === 0) {
      for (let i = 0; i < 8; i++) {
        const prod = productRecords[i % productRecords.length];
        const qty = Math.floor(Math.random() * 3) + 1;
        const sub = Number(prod.salePrice) * qty;
        const tax = sub * 0.05;
        await prisma.sale.create({
          data: {
            invoiceNo: `INV-2026051${i}-${1000 + i}`,
            cashierId: cashier.id,
            customerId: walkIn.id,
            subTotal: sub,
            taxAmount: tax,
            discount: 0,
            total: sub + tax,
            paymentMethod: ["CASH", "CARD", "MOBILE_BANKING"][i % 3] as any,
            paymentStatus: "PAID",
            status: "COMPLETED",
            createdAt: new Date(Date.now() - i * 86400000),
            items: {
              create: [{
                productId: prod.id,
                quantity: qty,
                unitPrice: prod.salePrice,
                subTotal: sub,
                tax,
                discount: 0,
                total: sub + tax,
              }],
            },
          },
        });
      }
    }
  }

  console.log(`Seeded ${products.length} products, warehouse, admin user, and sample sales.`);
  console.log(`Low stock threshold: ${LOW_STOCK}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
