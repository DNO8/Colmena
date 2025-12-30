import { NextRequest, NextResponse } from "next/server";
import {
  createIssuerAccount,
  getIssuerAccount,
} from "@/lib/services/issuerAccounts";

/**
 * POST endpoint to ensure a project has an issuer account
 * Creates one if it doesn't exist, returns existing if it does
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;

    // Check if issuer account already exists
    const existingIssuer = await getIssuerAccount(projectId);

    if (existingIssuer.account && !existingIssuer.error) {
      return NextResponse.json(
        {
          issuerPublicKey: existingIssuer.account.public_key,
          isFunded: existingIssuer.account.is_funded,
          isActive: existingIssuer.account.is_active,
          message: "Issuer account already exists",
        },
        { status: 200 },
      );
    }

    // Create new issuer account
    const result = await createIssuerAccount(projectId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Fetch the created account to return full details
    const newIssuer = await getIssuerAccount(projectId);

    if (newIssuer.error || !newIssuer.account) {
      return NextResponse.json(
        { error: "Issuer account created but could not be retrieved" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        issuerPublicKey: newIssuer.account.public_key,
        isFunded: newIssuer.account.is_funded,
        isActive: newIssuer.account.is_active,
        message: "Issuer account created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
