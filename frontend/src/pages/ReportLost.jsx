function ReportLost() {
  return (
    <div className="report-page">
      <h1>Report Lost Item</h1>

      <form>
        <label>Item Name</label>
        <input type="text" placeholder="Enter item name" />

        <label>Description</label>
        <textarea placeholder="Describe the item"></textarea>

        <label>Location Lost</label>
        <input type="text" placeholder="Enter location" />

        <label>Date Lost</label>
        <input type="date" />

        <button type="submit">Submit Lost Report</button>
      </form>
    </div>
  );
}

export default ReportLost;