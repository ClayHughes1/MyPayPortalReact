
export default function AutoPaySettings({ formData, handleChange }) 
{
    return(
        <div className="row align-items-center mb-3">
          <div className="col-sm-4 text-sm-end text-start">
            <label className="form-label mb-sm-0 fw-semibold">Payment Type</label>
          </div>
          <div className="col-md-8">
                <select
                    name="paymentFrequency"
                    value={formData.paymentFrequency}
                    onChange={handleChange}>
                    <option>Weekly</option>
                    <option>Biweekly</option>
                    <option>Monthly</option>
                </select>          
            </div>
        </div>
    );
}
