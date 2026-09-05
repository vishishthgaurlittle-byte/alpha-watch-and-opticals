import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_THEME, isValidThemeId } from "@/theme/palettes";

export async function GET() {
  try {
    const user = await getCurrentUser();

    let globalTheme = DEFAULT_THEME;
    try {
      const setting = await prisma.setting.findUnique({
        where: { id: "global_settings" }
      });
      if (setting?.globalTheme && isValidThemeId(setting.globalTheme)) {
        globalTheme = setting.globalTheme;
      }
    } catch {
      // fallback to default
    }

    const personalTheme = user?.themePreference || null;
    const resolvedTheme = personalTheme || globalTheme;

    return NextResponse.json({
      globalTheme,
      personalTheme,
      resolvedTheme,
      userId: user?.id || null
    });
  } catch {
    return NextResponse.json({
      globalTheme: DEFAULT_THEME,
      personalTheme: null,
      resolvedTheme: DEFAULT_THEME,
      userId: null
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    // 1. Reset personal theme override to follow store default
    if (body.reset === true) {
      if (user) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { themePreference: null }
          });
        } catch {
          // ignore if db unmounted
        }
      }
      const res = NextResponse.json({
        success: true,
        personalTheme: null,
        message: "Theme reset to store default"
      });
      res.cookies.delete("aw_theme");
      return res;
    }

    // 2. Validate requested themeId
    const { themeId } = body;
    if (!themeId || !isValidThemeId(themeId)) {
      return NextResponse.json(
        { error: "Invalid themeId. Must be one of: obsidian, midnight, oxblood, emerald, platinum" },
        { status: 400 }
      );
    }

    // 3. Save to customer user profile if authenticated
    if (user) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { themePreference: themeId }
        });
      } catch {
        // ignore if db unmounted
      }
    }

    const res = NextResponse.json({
      success: true,
      personalTheme: themeId,
      message: "Personal theme preference updated"
    });
    res.cookies.set("aw_theme", themeId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    });
    return res;
  } catch (err: any) {
    console.error("PATCH /api/theme error:", err);
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}
