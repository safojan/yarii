// rich-text-editor.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, AfterViewInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EditorConfig } from './models/editor-config.model';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})
export class RichTextEditorComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @ViewChild('editor', { static: true }) editorElement!: ElementRef<HTMLDivElement>;
  
  @Input() config: EditorConfig = {
    minHeight: '150px',
    maxHeight: '400px',
    placeholder: 'Start typing...',
    readOnly: false,
    initialContent: ''
  };

  @Output() contentChange = new EventEmitter<string>();
  
  content = '';
  showPlaceholder = true;
  isReadOnly = false;
  currentHeading = 'Body 1';
  wordCount = 0;
  maxWords = 500; // Default word limit
  
  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.isReadOnly = this.config.readOnly || false;
    this.maxWords = 500;
  }

  ngAfterViewInit() {
    if (this.config.initialContent) {
      this.editorElement.nativeElement.innerHTML = this.config.initialContent;
      this.content = this.config.initialContent;
      this.showPlaceholder = false;
      this.updateWordCount();
    }
    
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const editor = this.editorElement.nativeElement;
    
    editor.addEventListener('input', (e) => {
      this.onContentChange();
    });
    
    editor.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      this.insertText(text);
    });
    
    editor.addEventListener('keydown', (e) => {
      // Handle Enter key for proper paragraph creation
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.insertHTML('<br><br>');
      }
      
      // Prevent typing if word limit exceeded
      if (this.wordCount >= this.maxWords && !this.isNavigationKey(e)) {
        e.preventDefault();
      }
    });
    
    editor.addEventListener('blur', () => {
      this.onTouched();
      this.autoDetectLinks();
    });
  }

  private isNavigationKey(e: KeyboardEvent): boolean {
    const navigationKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    return navigationKeys.includes(e.key) || e.ctrlKey || e.metaKey;
  }

  private onContentChange() {
    const editor = this.editorElement.nativeElement;
    this.content = editor.innerHTML;
    this.showPlaceholder = editor.innerText.trim().length === 0;
    this.updateWordCount();
    this.onChange(this.content);
    this.contentChange.emit(this.content);
  }

  private updateWordCount() {
    const text = this.editorElement.nativeElement.innerText.trim();
    this.wordCount = text ? text.split(/\s+/).length : 0;
  }

  private insertHTML(html: string) {
    document.execCommand('insertHTML', false, html);
    this.onContentChange();
  }

  private insertText(text: string) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    this.onContentChange();
  }

  // Toolbar Functions
  formatBold() {
    document.execCommand('bold', false);
    this.onContentChange();
  }

  formatItalic() {
    document.execCommand('italic', false);
    this.onContentChange();
  }

  formatUnderline() {
    document.execCommand('underline', false);
    this.onContentChange();
  }

  formatHeading(level: string) {
    if (level === 'p') {
      document.execCommand('formatBlock', false, '<p>');
      this.currentHeading = 'Body 1';
    } else {
      document.execCommand('formatBlock', false, `<h${level}>`);
      this.currentHeading = `Heading ${level}`;
    }
    this.onContentChange();
  }

  formatBlock(tag: string) {
    document.execCommand('formatBlock', false, tag);
    this.currentHeading = 'Body 1';
    this.onContentChange();
  }

  formatBulletList() {
    document.execCommand('insertUnorderedList', false);
    this.onContentChange();
  }

  formatNumberedList() {
    document.execCommand('insertOrderedList', false);
    this.onContentChange();
  }

  formatQuote() {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString();
      this.insertHTML(`<blockquote>${selectedText}</blockquote>`);
    } else {
      this.insertHTML('<blockquote>Quote text here...</blockquote>');
    }
  }

  formatCode() {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const selectedText = selection.toString();
      this.insertHTML(`<code>${selectedText}</code>`);
    } else {
      this.insertHTML('<code>code</code>');
    }
  }

  insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
      const selection = window.getSelection();
      const text = selection?.toString() || url;
      this.insertHTML(`<a href="${url}" target="_blank">${text}</a>`);
    }
  }

  clearFormatting() {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      document.execCommand('removeFormat', false);
    } else {
      // Clear all formatting from the entire content
      const editor = this.editorElement.nativeElement;
      const text = editor.innerText;
      editor.innerHTML = `<p>${text}</p>`;
    }
    this.onContentChange();
  }

  private autoDetectLinks() {
    const editor = this.editorElement.nativeElement;
    const content = editor.innerHTML;
    
    // Regex to detect URLs
    const urlRegex = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/gi;
    
    const newContent = content.replace(urlRegex, (url) => {
      // Don't wrap if already wrapped in a link
      if (content.includes(`<a href="${url}"`)) {
        return url;
      }
      
      const href = url.startsWith('http') ? url : `http://${url}`;
      return `<a href="${href}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${url}</a>`;
    });
    
    if (newContent !== content) {
      editor.innerHTML = newContent;
      this.onContentChange();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (value !== undefined) {
      this.content = value;
      if (this.editorElement) {
        this.editorElement.nativeElement.innerHTML = value;
        this.showPlaceholder = !value || value.trim().length === 0;
        this.updateWordCount();
      }
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isReadOnly = isDisabled;
  }

  // Utility methods
  getWordCount(): number {
    return this.wordCount;
  }

  getContent(): string {
    return this.content;
  }

  setContent(content: string): void {
    this.writeValue(content);
  }

  focus(): void {
    this.editorElement.nativeElement.focus();
  }
}