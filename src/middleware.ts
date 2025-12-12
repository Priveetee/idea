import { NextResponse, type NextRequest } from "next/server";

type Bucket = {
  tokens: number;
  lastRefillMs: number;
};

const buckets = new Map<string, Bucket>();

function nowMs(): number {
  return Date.now();
}

function takeToken(opts: {
  key: string;
  capacity: number;
  refillPerSec: number;
}): boolean {
  const now = nowMs();
  const existing = buckets.get(opts.key);

  if (!existing) {
    buckets.set(opts.key, {
      tokens: opts.capacity - 1,
      lastRefillMs: now,
    });
    return true;
  }

  const elapsedSec = (now - existing.lastRefillMs) / 1000;
  const refill = elapsedSec * opts.refillPerSec;

  const nextTokens = Math.min(opts.capacity, existing.tokens + refill);

  if (nextTokens < 1) {
    buckets.set(opts.key, {
      tokens: nextTokens,
      lastRefillMs: now,
    });
    return false;
  }

  buckets.set(opts.key, {
    tokens: nextTokens - 1,
    lastRefillMs: now,
  });
  return true;
}

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function json429(): NextResponse {
  return NextResponse.json(
    { error: { message: "RATE_LIMITED" } },
    {
      status: 429,
      headers: {
        "retry-after": "3",
        "cache-control": "no-store",
      },
    },
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/trpc/")) {
    return NextResponse.next();
  }

  const ip = getIp(req);

  const keyBase = `${ip}:${pathname}`;

  const rules: Array<{
    match: (_path: string) => boolean;
    capacity: number;
    refillPerSec: number;
  }> = [
    {
      match: (_path) => _path === "/api/trpc/idea.addComment",
      capacity: 10,
      refillPerSec: 10 / 60,
    },
    {
      match: (_path) => _path === "/api/trpc/idea.addReaction",
      capacity: 60,
      refillPerSec: 60 / 60,
    },
    {
      match: (_path) => _path === "/api/trpc/idea.clearReactionsForEmoji",
      capacity: 60,
      refillPerSec: 60 / 60,
    },
    {
      match: (_path) => _path === "/api/trpc/idea.listPublic",
      capacity: 120,
      refillPerSec: 120 / 60,
    },
    {
      match: (_path) => _path === "/api/trpc/idea.byIdPublic",
      capacity: 120,
      refillPerSec: 120 / 60,
    },
  ];

  const rule = rules.find((r) => r.match(pathname));
  if (!rule) return NextResponse.next();

  const ok = takeToken({
    key: keyBase,
    capacity: rule.capacity,
    refillPerSec: rule.refillPerSec,
  });

  if (!ok) return json429();

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/trpc/:path*"],
};
