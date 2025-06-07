function catchAsync(fn: (req: any, res: any, next: any) => Promise<any>) {
  return function (req: any, res: any, next: any) {
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      next(err);
    }
  };
}

export default catchAsync;
