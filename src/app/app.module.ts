import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AdminModule } from './admin/admin.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { PublicModule } from './public/public.module';

import { httpInterceptorProviders } from './_core/interceptors/interceptors.provider';
import { StrategyProviders } from './_core/strategies/strategy.providers';
import { UtilsProviders } from './shared/utils/utils.providers';
import { AppInitService } from './_core/services/app-init.service';

// App initialization factory
export function initializeApp(appInitService: AppInitService) {
  return (): Promise<boolean> => appInitService.initializeApp();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AdminModule,
    PublicModule,
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [
    httpInterceptorProviders, 
    StrategyProviders, 
    UtilsProviders,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
