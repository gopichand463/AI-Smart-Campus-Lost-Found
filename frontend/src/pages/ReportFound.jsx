function ReportFound() {
  return (
    <div className="report-page">
      <h1>Report Found Item</h1>

      <form>
        <label>Item Name</label>
        <input type="text" placeholder="Enter item name" />

        <label>Description</label>
        <textarea placeholder="Describe the item"></textarea>

        <label>Location Found</label>
        <input type="text" placeholder="Enter location" />

        <label>Date Found</label>
        <input type="date" />

        <button type="submit">Submit Found Report</button>
      </form>
    </div>
  );
}

export default ReportFound;