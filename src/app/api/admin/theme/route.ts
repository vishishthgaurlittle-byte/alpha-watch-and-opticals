import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { isValidThemeId } from "@/theme/palettes";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const setting = await prisma.setting.findUnique({
      where: { id: "global_settings" }
    });

    return NextResponse.json({
      globalTheme: setting?.globalTheme || "obsidian",
      updatedByAdminId: setting?.updatedByAdminId || null,
      updatedAt: setting?.updatedAt || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch admin theme setting" }, { status: 500 });
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

    const updated = await prisma.setting.upsert({
      where: { id: "global_settings" },
      update: {
        globalTheme: themeId,
        updatedByAdminId: auth.user.id,
        updatedAt: new Date()
      },
      create: {
        id: "global_settings",
        globalTheme: themeId,
        updatedByAdminId: auth.user.id,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      globalTheme: updated.globalTheme,
      updatedByAdminId: updated.updatedByAdminId,
      updatedAt: updated.updatedAt,
      message: `Global store theme updated to "${themeId}" for all visitors without a personal override.`
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/theme error:", err);
    return NextResponse.json({ error: "Failed to update store global theme" }, { status: 500 });
  }
}
