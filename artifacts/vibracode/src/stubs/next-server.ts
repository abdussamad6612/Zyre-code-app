export function headers() {
  return new Headers();
}

export function cookies() {
  return {
    get: (_name: string) => undefined,
    set: () => {},
    delete: () => {},
    has: (_name: string) => false,
  };
}

export class NextRequest extends Request {}
export class NextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    return new NextResponse(JSON.stringify(data), {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  }
  static redirect(url: string, status = 302) {
    return new NextResponse(null, { status, headers: { Location: url } });
  }
}

export function notFound() {
  throw new Error("Not found");
}
