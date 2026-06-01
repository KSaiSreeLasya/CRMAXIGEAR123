import { supabase } from "@/lib/supabase";
import type { SplitPayment } from "@/components/SplitPaymentForm";

export interface Transaction {
  id: string;
  reference_type: "estimation" | "service_invoice" | "project";
  reference_id: string;
  total_amount: number;
  paid_amount: number;
  status: "partial" | "complete";
  created_at: string;
}

export interface SplitPaymentRecord extends SplitPayment {
  id: string;
  transaction_id: string;
}

export async function createTransaction(
  referenceType: "estimation" | "service_invoice" | "project",
  referenceId: string,
  totalAmount: number,
  splitPayments: SplitPayment[]
): Promise<Transaction | null> {
  if (!supabase) return null;

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.id) {
      console.error("User not authenticated for transaction creation");
      return null;
    }

    const paidAmount = splitPayments.reduce((sum, p) => sum + p.amount, 0);

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: userData.user.id,
        reference_type: referenceType,
        reference_id: referenceId,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        status: paidAmount >= totalAmount ? "complete" : "partial",
      })
      .select()
      .single();

    if (txError) {
      console.error("Failed to create transaction:", txError);
      return null;
    }

    // Create split payments
    const paymentsToInsert = splitPayments.map((payment) => ({
      transaction_id: transaction.id,
      amount: payment.amount,
      mode_of_payment: payment.modeOfPayment,
      payment_date: payment.paymentDate,
    }));

    const { error: paymentsError } = await supabase.from("split_payments").insert(paymentsToInsert);

    if (paymentsError) {
      console.error("Failed to create split payments:", paymentsError);
      return null;
    }

    return transaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    return null;
  }
}

export async function getTransactionByReference(
  referenceType: string,
  referenceId: string
): Promise<(Transaction & { split_payments: SplitPaymentRecord[] }) | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        id,
        reference_type,
        reference_id,
        total_amount,
        paid_amount,
        status,
        created_at,
        split_payments (
          id,
          transaction_id,
          amount,
          mode_of_payment,
          payment_date
        )
      `
      )
      .eq("reference_type", referenceType)
      .eq("reference_id", referenceId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Failed to get transaction:", error);
    }

    return data || null;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return null;
  }
}

export async function updateTransaction(
  transactionId: string,
  splitPayments: SplitPayment[]
): Promise<Transaction | null> {
  if (!supabase) return null;

  try {
    const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);

    // Get current transaction to check total amount
    const { data: transaction } = await supabase
      .from("transactions")
      .select("total_amount")
      .eq("id", transactionId)
      .single();

    if (!transaction) return null;

    // Delete old split payments
    await supabase.from("split_payments").delete().eq("transaction_id", transactionId);

    // Insert new split payments
    const paymentsToInsert = splitPayments.map((payment) => ({
      transaction_id: transactionId,
      amount: payment.amount,
      mode_of_payment: payment.modeOfPayment,
      payment_date: payment.paymentDate,
    }));

    await supabase.from("split_payments").insert(paymentsToInsert);

    // Update transaction status
    const { data, error } = await supabase
      .from("transactions")
      .update({
        paid_amount: totalPaid,
        status: totalPaid >= transaction.total_amount ? "complete" : "partial",
      })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update transaction:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating transaction:", error);
    return null;
  }
}

export async function deleteTransaction(transactionId: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("transactions").delete().eq("id", transactionId);

    if (error) {
      console.error("Failed to delete transaction:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
}

export async function getSplitPaymentsByReference(
  referenceType: string,
  referenceId: string
): Promise<SplitPayment[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        split_payments (
          amount,
          mode_of_payment,
          payment_date
        )
      `
      )
      .eq("reference_type", referenceType)
      .eq("reference_id", referenceId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Failed to get split payments:", error);
      return [];
    }

    if (!data || !data.split_payments) return [];

    return data.split_payments.map((sp: any) => ({
      amount: sp.amount,
      modeOfPayment: sp.mode_of_payment,
      paymentDate: sp.payment_date,
    }));
  } catch (error) {
    console.error("Error fetching split payments:", error);
    return [];
  }
}
