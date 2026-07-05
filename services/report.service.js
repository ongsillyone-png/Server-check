const ReportRepository = require('../repositories/report.repository');

class ReportService {
  static async getDailyReport(date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const data = await ReportRepository.getDailyReportData(targetDate);
    // Convert BigInt keys to Number safely to prevent JSON/EJS serialization crashes
    return data.map(item => ({
      ...item,
      session_id: Number(item.session_id),
      detail_id: Number(item.detail_id)
    }));
  }

  static async getMonthlyReport(year, month) {
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || (new Date().getMonth() + 1);

    const data = await ReportRepository.getMonthlyReportData(targetYear, targetMonth);
    return data.map(item => ({
      ...item,
      total_sessions: Number(item.total_sessions),
      total_inspected: Number(item.total_inspected),
      pass_count: Number(item.pass_count),
      warn_count: Number(item.warn_count),
      fail_count: Number(item.fail_count)
    }));
  }

  static async getYearlyReport(year) {
    const targetYear = parseInt(year) || new Date().getFullYear();
    const data = await ReportRepository.getYearlyReportData(targetYear);
    return data.map(item => ({
      ...item,
      total_sessions: Number(item.total_sessions),
      total_inspected: Number(item.total_inspected),
      pass_count: Number(item.pass_count),
      warn_count: Number(item.warn_count),
      fail_count: Number(item.fail_count)
    }));
  }

  static async getServerSummary() {
    const data = await ReportRepository.getServerSummaryData();
    return data.map(item => ({
      ...item,
      server_id: Number(item.server_id),
      total_inspected: Number(item.total_inspected),
      pass_count: Number(item.pass_count),
      warn_count: Number(item.warn_count),
      fail_count: Number(item.fail_count)
    }));
  }

  static async getRackSummary() {
    const data = await ReportRepository.getRackSummaryData();
    return data.map(item => ({
      ...item,
      rack_id: Number(item.rack_id),
      total_inspected: Number(item.total_inspected),
      pass_count: Number(item.pass_count),
      warn_count: Number(item.warn_count),
      fail_count: Number(item.fail_count)
    }));
  }

  static async getRoomSummary() {
    const data = await ReportRepository.getRoomSummaryData();
    return data.map(item => ({
      ...item,
      room_id: Number(item.room_id),
      total_inspected: Number(item.total_inspected),
      pass_count: Number(item.pass_count),
      warn_count: Number(item.warn_count),
      fail_count: Number(item.fail_count)
    }));
  }

  static async getUserSummary() {
    const data = await ReportRepository.getUserSummaryData();
    return data.map(item => ({
      ...item,
      user_id: Number(item.user_id),
      completed_sessions: Number(item.completed_sessions)
    }));
  }

  static async getVmSummary() {
    const data = await ReportRepository.getVmSummaryData();
    return data.map(item => ({
      ...item,
      vm_id: Number(item.vm_id),
      total_inspected: Number(item.total_inspected),
      pass_count: Number(item.pass_count),
      warn_count: Number(item.warn_count),
      fail_count: Number(item.fail_count)
    }));
  }

  /**
   * Helper to format report datasets for CSV exporting
   */
  static async getExportCSVData(reportType, queryParams) {
    let rawData = [];
    let headers = [];
    let mappedRows = [];

    const statusMap = { 'pass': 'ปกติ / ผ่าน', 'warning': 'เฝ้าระวัง', 'fail': 'ผิดปกติ' };

    switch (reportType) {
      case 'daily': {
        const date = queryParams.date || new Date().toISOString().split('T')[0];
        rawData = await this.getDailyReport(date);
        headers = ['รอบตรวจ', 'เวลาส่งมอบ', 'ผู้ตรวจ', 'เซิร์ฟเวอร์', 'ห้อง', 'ตู้แร็ค', 'สถานะ', 'หมายเหตุ'];
        mappedRows = rawData.map(r => ({
          'รอบตรวจ': `#${r.session_id}`,
          'เวลาส่งมอบ': r.completed_at ? new Date(r.completed_at).toLocaleString('th-TH') : '-',
          'ผู้ตรวจ': r.inspector_name,
          'เซิร์ฟเวอร์': r.server_name,
          'ห้อง': r.room_name,
          'ตู้แร็ค': r.rack_name,
          'สถานะ': statusMap[r.overall_status] || r.overall_status,
          'หมายเหตุ': r.server_remark || '-'
        }));
        break;
      }
      case 'monthly': {
        const year = queryParams.year || new Date().getFullYear();
        const month = queryParams.month || (new Date().getMonth() + 1);
        rawData = await this.getMonthlyReport(year, month);
        headers = ['วันที่ตรวจ', 'จำนวนรอบตรวจ', 'จำนวนเครื่องที่ตรวจ', 'ปกติ (PASS)', 'เฝ้าระวัง (WARN)', 'ผิดปกติ (FAIL)'];
        mappedRows = rawData.map(r => ({
          'วันที่ตรวจ': new Date(r.inspect_date).toLocaleDateString('th-TH'),
          'จำนวนรอบตรวจ': r.total_sessions,
          'จำนวนเครื่องที่ตรวจ': r.total_inspected,
          'ปกติ (PASS)': r.pass_count,
          'เฝ้าระวัง (WARN)': r.warn_count,
          'ผิดปกติ (FAIL)': r.fail_count
        }));
        break;
      }
      case 'yearly': {
        const year = queryParams.year || new Date().getFullYear();
        rawData = await this.getYearlyReport(year);
        const thaiMonths = [
          'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        headers = ['เดือน', 'จำนวนรอบตรวจ', 'จำนวนเครื่องที่ตรวจ', 'ปกติ (PASS)', 'เฝ้าระวัง (WARN)', 'ผิดปกติ (FAIL)'];
        mappedRows = rawData.map(r => ({
          'เดือน': thaiMonths[r.inspect_month - 1] || r.inspect_month,
          'จำนวนรอบตรวจ': r.total_sessions,
          'จำนวนเครื่องที่ตรวจ': r.total_inspected,
          'ปกติ (PASS)': r.pass_count,
          'เฝ้าระวัง (WARN)': r.warn_count,
          'ผิดปกติ (FAIL)': r.fail_count
        }));
        break;
      }
      case 'server': {
        rawData = await this.getServerSummary();
        headers = ['เครื่องเซิร์ฟเวอร์', 'Model', 'IP Address', 'ตู้แร็ค', 'ห้อง', 'ตรวจทั้งหมด (ครั้ง)', 'ปกติ (PASS)', 'เฝ้าระวัง (WARN)', 'ผิดปกติ (FAIL)'];
        mappedRows = rawData.map(r => ({
          'เครื่องเซิร์ฟเวอร์': r.server_name,
          'Model': r.model || '-',
          'IP Address': r.ip_address || '-',
          'ตู้แร็ค': r.rack_name,
          'ห้อง': r.room_name,
          'ตรวจทั้งหมด (ครั้ง)': r.total_inspected,
          'ปกติ (PASS)': r.pass_count,
          'เฝ้าระวัง (WARN)': r.warn_count,
          'ผิดปกติ (FAIL)': r.fail_count
        }));
        break;
      }
      case 'rack': {
        rawData = await this.getRackSummary();
        headers = ['ตู้แร็ค', 'ห้อง', 'ตรวจทั้งหมด (ครั้ง)', 'ปกติ (PASS)', 'เฝ้าระวัง (WARN)', 'ผิดปกติ (FAIL)'];
        mappedRows = rawData.map(r => ({
          'ตู้แร็ค': r.rack_name,
          'ห้อง': r.room_name,
          'ตรวจทั้งหมด (ครั้ง)': r.total_inspected,
          'ปกติ (PASS)': r.pass_count,
          'เฝ้าระวัง (WARN)': r.warn_count,
          'ผิดปกติ (FAIL)': r.fail_count
        }));
        break;
      }
      case 'room': {
        rawData = await this.getRoomSummary();
        headers = ['ห้อง Server', 'อาคาร', 'ชั้น', 'ตรวจทั้งหมด (ครั้ง)', 'ปกติ (PASS)', 'เฝ้าระวัง (WARN)', 'ผิดปกติ (FAIL)'];
        mappedRows = rawData.map(r => ({
          'ห้อง Server': r.room_name,
          'อาคาร': r.building,
          'ชั้น': r.floor,
          'ตรวจทั้งหมด (ครั้ง)': r.total_inspected,
          'ปกติ (PASS)': r.pass_count,
          'เฝ้าระวัง (WARN)': r.warn_count,
          'ผิดปกติ (FAIL)': r.fail_count
        }));
        break;
      }
      case 'user': {
        rawData = await this.getUserSummary();
        headers = ['ชื่อผู้ใช้งาน', 'Username', 'สิทธิ์การใช้งาน', 'จำนวนรอบตรวจที่สำเร็จ (รอบ)'];
        mappedRows = rawData.map(r => ({
          'ชื่อผู้ใช้งาน': r.user_name,
          'Username': r.username,
          'สิทธิ์การใช้งาน': r.role_name,
          'จำนวนรอบตรวจที่สำเร็จ (รอบ)': r.completed_sessions
        }));
        break;
      }
      default:
        throw new Error('ประเภทรายงานไม่ถูกต้อง');
    }

    return { headers, rows: mappedRows };
  }
}

module.exports = ReportService;
