import { Injectable, inject, signal, computed } from '@angular/core';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Ability as UserAbility, Actions, Subjects } from '@core/models';

export type AppAbility = PureAbility<[Actions, Subjects]>;

@Injectable({
  providedIn: 'root'
})
export class AbilityService {
  private readonly abilitySignal = signal<AppAbility>(this.createAbility([]));

  readonly ability = this.abilitySignal.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  readonly canCreateTask = computed(() => this.abilitySignal().can('create', 'Task'));
  readonly canReadTask = computed(() => this.abilitySignal().can('read', 'Task'));
  readonly canUpdateTask = computed(() => this.abilitySignal().can('update', 'Task'));
  readonly canDeleteTask = computed(() => this.abilitySignal().can('delete', 'Task'));
  readonly canCompleteTask = computed(() => this.abilitySignal().can('complete', 'Task'));

  readonly canReadUser = computed(() => this.abilitySignal().can('read', 'User'));
  readonly canUpdateUser = computed(() => this.abilitySignal().can('update', 'User'));

  updateAbilities(abilities: UserAbility[]): void {
    const newAbility = this.createAbility(abilities);
    this.abilitySignal.set(newAbility);
    this.saveToStorage(abilities);
  }

  loadFromStorage(): void {
    const stored = localStorage.getItem('user_abilities');
    if (stored) {
      try {
        const abilities = JSON.parse(stored) as UserAbility[];
        if (abilities.length > 0) {
          this.abilitySignal.set(this.createAbility(abilities));
          return;
        }
      } catch {
        // Continue to check user
      }
    }

    const userStored = localStorage.getItem('user');
    if (userStored) {
      try {
        const user = JSON.parse(userStored);
        if (user.abilities && user.abilities.length > 0) {
          this.abilitySignal.set(this.createAbility(user.abilities));
          this.saveToStorage(user.abilities);
        }
      } catch {
        this.abilitySignal.set(this.createAbility([]));
      }
    }
  }

  clearAbilities(): void {
    this.abilitySignal.set(this.createAbility([]));
    localStorage.removeItem('user_abilities');
  }

  can(action: Actions, subject: Subjects): boolean {
    return this.abilitySignal().can(action, subject);
  }

  cannot(action: Actions, subject: Subjects): boolean {
    return this.abilitySignal().cannot(action, subject);
  }

  private createAbility(abilities: UserAbility[]): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

    abilities.forEach(ability => {
      can(ability.action, ability.subject);
    });

    return build();
  }

  private saveToStorage(abilities: UserAbility[]): void {
    localStorage.setItem('user_abilities', JSON.stringify(abilities));
  }
}
