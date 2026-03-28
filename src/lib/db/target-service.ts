import db from './index';

export interface Target {
  id: number;
  company_name: string;
  url: string;
  created_at: string;
}

export class TargetService {
  static getAll(): Target[] {
    return db.prepare('SELECT * FROM targets').all() as Target[];
  }

  static getById(id: number): Target | undefined {
    return db.prepare('SELECT * FROM targets WHERE id = ?').get(id) as Target | undefined;
  }

  static create(company_name: string, url: string): number | bigint {
    const info = db.prepare('INSERT INTO targets (company_name, url) VALUES (?, ?)').run(company_name, url);
    return info.lastInsertRowid;
  }

  static update(id: number, company_name: string, url: string): boolean {
    const info = db.prepare('UPDATE targets SET company_name = ?, url = ? WHERE id = ?').run(company_name, url, id);
    return info.changes > 0;
  }

  static delete(id: number): boolean {
    const info = db.prepare('DELETE FROM targets WHERE id = ?').run(id);
    return info.changes > 0;
  }
}
