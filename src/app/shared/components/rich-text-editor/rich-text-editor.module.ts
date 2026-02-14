// rich-text-editor.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RichTextEditorComponent } from './rich-text-editor.component';

@NgModule({
  declarations: [RichTextEditorComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [RichTextEditorComponent]
})
export class RichTextEditorModule { }