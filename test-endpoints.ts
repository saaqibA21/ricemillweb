import dataHandler from './api/admin/data';
import productsHandler from './api/admin/products';

async function test() {
  const req: any = {
    method: 'GET',
    query: {},
    headers: { authorization: 'Bearer test-token' },
  };

  let resCode = 0;
  let resData: any = null;
  const res: any = {
    status(c: number) { resCode = c; return this; },
    json(d: any) { resData = d; return this; },
  };

  await dataHandler(req, res);
  console.log('admin/data status:', resCode);
  console.log('admin/data stats:', resData?.stats ? 'OK' : 'MISSING');

  await productsHandler(req, res);
  console.log('admin/products status:', resCode);
  console.log('admin/products count:', resData?.length);
}

test().catch(console.error);
