class InspectionController {
  // GET /inspections/walk
  static showWalkthrough(req, res) {
    res.render('inspection/walk', {
      title: 'Walkthrough Inspection - Server Check',
      currentPage: 'inspections'
    });
  }

  // GET /inspections/history
  static showHistory(req, res) {
    res.render('inspection/history', {
      title: 'Inspection History - Server Check',
      currentPage: 'inspections'
    });
  }

  // GET /inspections/:id
  static showInspectionDetail(req, res) {
    res.render('inspection/detail', {
      title: 'Inspection Details - Server Check',
      currentPage: 'inspections',
      inspectionId: req.params.id
    });
  }
}

module.exports = InspectionController;
