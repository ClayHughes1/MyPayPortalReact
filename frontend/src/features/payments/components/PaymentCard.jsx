export default function PaymentCard({
payment,
onDelete,
onUpdate
}) {


    return (
        <div className="card shadow-sm">
            <div className="card-header">

            <h5>

            {payment.loanType}

            </h5>

            </div>

            <div className="card-body">


            <p>
            <strong>Lender:</strong>
            {payment.lenderName}
            </p>


            <p>
            <strong>Account:</strong>
            {payment.maskedAccountNumber}
            </p>


            <p>
            <strong>Balance:</strong>
            ${payment.currentBalance}
            </p>


            <p>
            <strong>AutoPay Amount:</strong>
            ${payment.paymentAmount}
            </p>


            <p>
            <strong>Frequency:</strong>
            {payment.paymentFrequency}
            </p>


            <p>
            <strong>Next Payment:</strong>
            {payment.paymentDate
                ? new Date(payment.paymentDate).toLocaleDateString()
                : ""}
            </p>



            <button
            className="btn btn-sm btn-primary me-2"
            onClick={()=>onUpdate(payment)}
            >

            Edit

            </button>



            <button
            className="btn btn-sm btn-danger"
            onClick={()=>onDelete(payment.id)}
            >

            Delete

            </button>



            </div>
        </div>
    );
}