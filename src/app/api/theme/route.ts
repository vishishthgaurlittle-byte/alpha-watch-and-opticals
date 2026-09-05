import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_THEME, isValidThemeId } from "@/theme/palettes";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const setting = await prisma.setting.findUnique({
      where: { id: "global_settings" }
    });

    const globalTheme = setting?.globalTheme || DEFAULT_THEME;
    const personalTheme = user?.themePreference || null;
    const resolvedTheme = personalTheme || globalTheme;

    return NextResponse.json({
      globalTheme,
      personalTheme,
      resolvedTheme,
      userId: user?.id || null
    });
  } catch (err: any) {
    console.error("GET /api/theme error:", err);
    return NextResponse.json(
      { globalTheme: DEFAULT_THEME, personalTheme: null, resolvedTheme: DEFAULT_THEME },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    // 1. Reset personal theme override to follow store default
    if (body.reset === true) {
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { themePreference: null }
        });
      }
      return NextResponse.json({
        success: true,
        personalTheme: null,
        message: "Theme reset to store default"
      });
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
      await prisma.user.update({
        where: { id: user.id },
        data: { themePreference: themeId }
      });
    }

    return NextResponse.json({
      success: true,
      personalTheme: themeId,
      message: "Personal theme preference updated"
    });
  } catch (err: any) {
    console.error("PATCH /api/theme error:", err);
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}
