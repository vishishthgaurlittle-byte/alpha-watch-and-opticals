import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2, "Title is too short").max(100),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(1000)
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to post a review." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid review data" },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment } = parsed.data;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        userName: user.name,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        status: "approved" // auto-approve verified customer reviews
      }
    });

    // Recalculate product rating and reviewsCount
    const allApproved = await prisma.review.findMany({
      where: { productId, status: "approved" }
    });

    const avgRating =
      allApproved.reduce((acc, r) => acc + r.rating, 0) / (allApproved.length || 1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: allApproved.length
      }
    });

    return NextResponse.json({
      success: true,
      message: "Your review has been submitted successfully!",
      review
    });
  } catch (err: any) {
    console.error("Review creation error:", err);
    return NextResponse.json(
      { error: "Failed to submit review." },
      { status: 500 }
    );
  }
}
