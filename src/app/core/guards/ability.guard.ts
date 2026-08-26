import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AbilityService, StorageService } from '@core/services';
import { Actions, Subjects } from '@core/models';

export interface AbilityGuardData {
  action: Actions;
  subject: Subjects;
}

export const abilityGuard: CanActivateFn = (route, state) => {
  const abilityService = inject(AbilityService);
  const storageService = inject(StorageService);
  const router = inject(Router);

  const data = route.data as AbilityGuardData;
  
  if (!data?.action || !data?.subject) {
    return true;
  }

  if (abilityService.can(data.action, data.subject)) {
    return true;
  }

  storageService.clear();
  abilityService.clearAbilities();
  router.navigate(['/login']);
  return false;
};
