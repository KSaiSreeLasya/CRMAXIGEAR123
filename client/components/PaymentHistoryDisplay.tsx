import { SplitPayment } from "@/components/SplitPaymentForm";
import { cn } from "@/lib/utils";

interface PaymentHistoryDisplayProps {
  payments: SplitPayment[];
  totalAmount: number;
}

export function PaymentHistoryDisplay({ payments, totalAmount }: PaymentHistoryDisplayProps) {
  if (payments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No payment history available
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, totalAmount - totalPaid);
  const isFullyPaid = remaining === 0;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-medium">Total Amount</p>
            <p className="text-lg font-semibold">Rs {totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Total Paid</p>
            <p className={cn("text-lg font-semibold", isFullyPaid ? "text-green-600" : "text-orange-600")}>
              Rs {totalPaid.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Remaining</p>
            <p className={cn("text-lg font-semibold", remaining === 0 ? "text-green-600" : "text-red-600")}>
              Rs {remaining.toFixed(2)}
            </p>
          </div>
        </div>
        {isFullyPaid && <p className="text-xs text-green-600 font-medium mt-3">✓ Payment Complete</p>}
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Payment Breakdown</h4>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 text-left font-medium">Amount</th>
                <th className="px-4 py-2 text-left font-medium">Payment Method</th>
                <th className="px-4 py-2 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-4 py-2 font-semibold">Rs {payment.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 text-gray-600">{payment.modeOfPayment}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
