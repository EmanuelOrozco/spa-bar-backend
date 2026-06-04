import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const EMPLOYEE_PASSWORD = 'Employee123!';

const STAFF = [
  { name: 'Alex Gerente', email: 'admin@spabar.com', role: 'admin' as const, position: 'Gerente General' },
  { name: 'Carlos R.', email: 'carlos@spabar.com', role: 'employee' as const, position: 'Jefe de Barra' },
  { name: 'Sofia M.', email: 'sofia@spabar.com', role: 'employee' as const, position: 'Camarera' },
  { name: 'Jorge L.', email: 'jorge@spabar.com', role: 'employee' as const, position: 'Cocina' },
  { name: 'Ana P.', email: 'ana@spabar.com', role: 'employee' as const, position: 'Hostess' },
  { name: 'Miguel T.', email: 'miguel@spabar.com', role: 'employee' as const, position: 'Bartender' },
  { name: 'Laura V.', email: 'laura@spabar.com', role: 'employee' as const, position: 'Camarera' },
  { name: 'Diego M.', email: 'diego@spabar.com', role: 'employee' as const, position: 'Seguridad' },
];

async function main() {
  const employeeHash = await bcrypt.hash(EMPLOYEE_PASSWORD, 10);

  let adminId = '';

  for (const member of STAFF) {
    const passwordHash =
      member.role === 'admin' ? await bcrypt.hash('Admin123!', 10) : employeeHash;

    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {
        name: member.name,
        position: member.position,
        role: member.role,
        isActive: true,
      },
      create: {
        name: member.name,
        email: member.email,
        passwordHash,
        role: member.role,
        position: member.position,
      },
    });

    if (member.role === 'admin') adminId = user.id;
  }

  const products = [
    {
      sku: 'CCK-001',
      name: 'Old Fashioned',
      description: 'Bourbon, Angostura, azúcar, piel de naranja. Clásico atemporal.',
      category: 'COCKTAILS' as const,
      price: 12.0,
      stock: 999,
      minStock: 0,
      unit: 'unidad',
      isMenuItem: true,
      status: 'ACTIVE' as const,
    },
    {
      sku: 'CCK-002',
      name: 'Martini Bond',
      description: 'Gin premium, Vodka, Lillet Blanc. Agitado, no revuelto.',
      category: 'COCKTAILS' as const,
      price: 14.5,
      stock: 12,
      minStock: 5,
      unit: 'unidad',
      isMenuItem: true,
      status: 'ACTIVE' as const,
    },
    {
      sku: 'FD-001',
      name: 'Bar Burger',
      description: '200g carne Angus, queso cheddar, cebolla caramelizada, brioche.',
      category: 'MAINS' as const,
      price: 16.0,
      stock: 5,
      minStock: 10,
      unit: 'unidad',
      isMenuItem: true,
      status: 'LOW_STOCK' as const,
    },
    {
      sku: 'FD-002',
      name: 'Nachos Supreme',
      description: 'Totopos caseros, guacamole, frijoles refritos, pico de gallo.',
      category: 'APPETIZERS' as const,
      price: 10.0,
      stock: 20,
      minStock: 5,
      unit: 'unidad',
      isMenuItem: true,
      status: 'ACTIVE' as const,
    },
    {
      sku: 'BEV-001',
      name: 'IPA Local',
      description: 'Cerveza artesanal de la casa. Notas cítricas y amargas.',
      category: 'BEERS' as const,
      price: 8.0,
      stock: 80,
      minStock: 20,
      unit: 'barril %',
      isMenuItem: true,
      status: 'ACTIVE' as const,
    },
    {
      sku: 'LIQ-001',
      name: 'Vodka Premium',
      description: 'Vodka importado para cócteles premium.',
      category: 'LIQUOR' as const,
      price: 0,
      stock: 1,
      minStock: 5,
      unit: 'Botella',
      isMenuItem: false,
      status: 'LOW_STOCK' as const,
    },
    {
      sku: 'FRE-042',
      name: 'Limones',
      description: 'Fruta fresca para barra.',
      category: 'FRUITS' as const,
      price: 0,
      stock: 5,
      minStock: 10,
      unit: 'Kg',
      isMenuItem: false,
      status: 'LOW_STOCK' as const,
    },
    {
      sku: 'LIQ-005',
      name: 'Gin London Dry',
      description: 'Gin seco para cócteles clásicos.',
      category: 'LIQUOR' as const,
      price: 0,
      stock: 12,
      minStock: 4,
      unit: 'Botella',
      isMenuItem: false,
      status: 'ACTIVE' as const,
    },
    {
      sku: 'BEV-102',
      name: 'Agua Tónica',
      description: 'Latas para cócteles.',
      category: 'SOFT_DRINKS' as const,
      price: 0,
      stock: 48,
      minStock: 24,
      unit: 'Latas',
      isMenuItem: false,
      status: 'ACTIVE' as const,
    },
    {
      sku: 'BEV-009',
      name: 'Coca Cola',
      description: 'Refresco para barra.',
      category: 'SOFT_DRINKS' as const,
      price: 0,
      stock: 120,
      minStock: 50,
      unit: 'Botella',
      isMenuItem: false,
      status: 'ACTIVE' as const,
    },
    {
      sku: 'MSC-022',
      name: 'Servilletas Cocktail',
      description: 'Insumos de barra.',
      category: 'SUPPLIES' as const,
      price: 0,
      stock: 2,
      minStock: 5,
      unit: 'Paquetes',
      isMenuItem: false,
      status: 'LOW_STOCK' as const,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        minStock: product.minStock,
        unit: product.unit,
        isMenuItem: product.isMenuItem,
        status: product.status,
      },
      create: product,
    });
  }

  const tables = [
    { number: '1', name: 'Mesa 1', capacity: 4, location: 'Salón principal', status: 'OCCUPIED' as const },
    { number: '2', name: 'Mesa 2', capacity: 4, location: 'Salón principal', status: 'AVAILABLE' as const },
    { number: '4', name: 'Mesa 4', capacity: 6, location: 'Salón principal', status: 'OCCUPIED' as const },
    { number: '8', name: 'Mesa 8', capacity: 4, location: 'Terraza', status: 'RESERVED' as const },
    { number: 'B2', name: 'Barra 2', capacity: 2, location: 'Barra', status: 'OCCUPIED' as const },
    { number: 'B1', name: 'Barra 1', capacity: 2, location: 'Barra', status: 'AVAILABLE' as const },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { number: table.number },
      update: {
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
      },
      create: table,
    });
  }

  const table8 = await prisma.table.findUnique({ where: { number: '8' } });
  if (table8 && adminId) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0);

    const existingReservation = await prisma.reservation.findFirst({
      where: { customerName: 'Cliente VIP' },
    });

    if (!existingReservation) {
      await prisma.reservation.create({
        data: {
          tableId: table8.id,
          userId: adminId,
          customerName: 'Cliente VIP',
          customerPhone: '+57 300 123 4567',
          guestCount: 4,
          reservedAt: tomorrow,
          status: 'CONFIRMED',
          notes: 'Mesa terraza, cumpleaños',
        },
      });
    }
  }

  const orderCount = await prisma.order.count();
  if (orderCount < 2 && adminId) {
    const table4 = await prisma.table.findUnique({ where: { number: '4' } });
    const tableB2 = await prisma.table.findUnique({ where: { number: 'B2' } });
    const oldFashioned = await prisma.product.findUnique({ where: { sku: 'CCK-001' } });
    const nachos = await prisma.product.findUnique({ where: { sku: 'FD-002' } });

    if (table4 && tableB2 && oldFashioned && nachos) {
      await prisma.order.create({
        data: {
          userId: adminId,
          tableId: table4.id,
          status: 'DELIVERED',
          total: 34.0,
          items: {
            create: [
              { productId: oldFashioned.id, quantity: 2, unitPrice: 12.0, subtotal: 24.0 },
              { productId: nachos.id, quantity: 1, unitPrice: 10.0, subtotal: 10.0 },
            ],
          },
        },
      });

      await prisma.order.create({
        data: {
          userId: adminId,
          tableId: tableB2.id,
          status: 'PREPARING_BAR',
          total: 12.0,
          items: {
            create: [
              { productId: oldFashioned.id, quantity: 1, unitPrice: 12.0, subtotal: 12.0 },
            ],
          },
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('\n=== Credenciales SpaBar ===');
  // eslint-disable-next-line no-console
  console.log('Admin:    admin@spabar.com / Admin123!');
  // eslint-disable-next-line no-console
  console.log(`Empleados: (todos) / ${EMPLOYEE_PASSWORD}`);
  STAFF.filter((s) => s.role === 'employee').forEach((s) => {
    // eslint-disable-next-line no-console
    console.log(`  - ${s.name}: ${s.email}`);
  });
  // eslint-disable-next-line no-console
  console.log('===========================\n');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
