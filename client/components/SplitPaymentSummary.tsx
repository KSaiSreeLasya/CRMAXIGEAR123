import { SplitPayment } from "@/components/SplitPaymentForm";

interface SplitPaymentSummaryProps {
  payments: SplitPayment[];
  totalAmount: number;
}

export function SplitPaymentSummary({
  payments,
  totalAmount,
}: SplitPaymentSummaryProps) {
  if (!payments || payments.length === 0) {
    return null;
  }

  // Group payments by mode
  const paymentsByMode = payments.reduce(
    (acc, payment) => {
      const mode = payment.modeOfPayment;
      acc[mode] = (acc[mode] || 0) + payment.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, totalAmount - totalPaid);

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      <h3 className="font-semibold text-sm mb-4">Payment Summary</h3>
      <div className="space-y-2">
        {Object.entries(paymentsByMode).map(([mode, amount]) => (
          <div
            key={mode}
            className="flex justify-between items-center text-sm py-1"
          >
            <span className="text-muted-foreground">{mode}:</span>
            <span className="font-medium">₹{amount.toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 mt-2 flex justify-between items-center font-medium">
          <span>Total Paid:</span>
          <span className="text-success">₹{totalPaid.toFixed(2)}</span>
        </div>
        {remaining > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Remaining:</span>
            <span>₹{remaining.toFixed(2)}</span>
          </div>
        )}
        {remaining < 0 && (
          <div className="flex justify-between items-center text-sm text-orange-600">
            <span>Overpaid:</span>
            <span>₹{Math.abs(remaining).toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
