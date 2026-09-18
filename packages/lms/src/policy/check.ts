export interface PolicyCheck {
  allowed: boolean;
  errors: string[];
}

export function check(errors: string[]): PolicyCheck {
  return { allowed: errors.length === 0, errors };
}

/** An actor as the LMS service layer sees them: permissions come from identity roles. */
export interface LmsActor {
  personId: string;
  name: string;
  roleIds: string[];
}
