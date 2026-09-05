import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { isValidThemeId, DEFAULT_THEME } from "@/theme/palettes";
import { getSetting, setSetting } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    let globalTheme = getSetting("globalTheme", DEFAULT_THEME);
    let updatedByAdminId: string | null = null;
    let updatedAt: any = null;

    try {
      const setting = await prisma.setting.findUnique({
        where: { id: "global_settings" }
      });
      if (setting?.globalTheme && isValidThemeId(setting.globalTheme)) {
        globalTheme = setting.globalTheme;
        updatedByAdminId = setting.updatedByAdminId || null;
        updatedAt = setting.updatedAt || null;
      }
    } catch (dbErr) {
      console.warn("Prisma setting read warning:", dbErr);
    }

    return NextResponse.json({
      globalTheme,
      updatedByAdminId,
      updatedAt
    });
  } catch (err: any) {
    return NextResponse.json({
      globalTheme: DEFAULT_THEME,
      updatedByAdminId: null,
      updatedAt: null
    }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized || !auth.user) return auth.response;

  try {
    const body = await req.json();
    const { themeId } = body;

    if (!themeId || !isValidThemeId(themeId)) {
      return NextResponse.json(
        { error: "Invalid themeId. Must be one of: obsidian, midnight, oxblood, emerald, platinum" },
        { status: 400 }
      );
    }

    let updatedGlobalTheme: any = themeId;
    const now = new Date();

    try {
      const updated = await prisma.setting.upsert({
        where: { id: "global_settings" },
        update: {
          globalTheme: themeId,
          updatedByAdminId: auth.user.id,
          updatedAt: now
        },
        create: {
          id: "global_settings",
          globalTheme: themeId,
          updatedByAdminId: auth.user.id,
          updatedAt: now
        }
      });
      if (updated?.globalTheme) {
        updatedGlobalTheme = updated.globalTheme;
      }
    } catch (dbErr) {
      console.warn("Prisma setting upsert fallback:", dbErr);
    }

    // Persist to store
    setSetting("globalTheme", themeId);

    const res = NextResponse.json({
      success: true,
      globalTheme: updatedGlobalTheme,
      updatedByAdminId: auth.user.id,
      updatedAt: now.toISOString(),
      message: `Global store theme updated to "${themeId}" for all visitors without a personal override.`
    });

    res.cookies.set("aw_theme", themeId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    });

    return res;
  } catch (err: any) {
    console.error("PATCH /api/admin/theme error:", err);
    return NextResponse.json({ error: "Failed to update store global theme" }, { status: 500 });
  }
}
