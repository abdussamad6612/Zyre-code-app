export const api: any = new Proxy({}, {
  get: () => new Proxy({}, {
    get: () => new Proxy({}, {
      get: () => 'stub'
    })
  })
});
