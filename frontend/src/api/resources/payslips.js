import BaseResource from './base';

class PayslipResource extends BaseResource {
  constructor() {
    super('payslips');
  }
}

export const payslipsApi = new PayslipResource();
