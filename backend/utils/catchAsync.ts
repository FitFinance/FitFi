function catchAsync(fn: (req: any, res: any, next: any) => any) {
  return function (req: any, res: any, next: any) {
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      console.log('Error: Catched by catchAsync');
      next(err);
    }
  };
}

export default catchAsync;
