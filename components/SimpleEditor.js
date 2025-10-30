"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./SimpleEditor.module.css";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaLink,
  FaUnlink,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaCode,
  FaQuoteRight,
  FaImage,
  FaTable,
  FaUndo,
  FaRedo,
  FaFont,
  FaPalette,
  FaHighlighter,
  FaIndent,
  FaOutdent,
  FaSubscript,
  FaSuperscript,
  FaRemoveFormat,
  FaMinus,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

export default function SimpleEditor({ value = "", onChange }) {
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState("14");
  const [currentFontFamily, setCurrentFontFamily] = useState("Arial");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
      setIsEditorReady(true);
    }
  }, []);

  useEffect(() => {
    if (
      isEditorReady &&
      editorRef.current &&
      value !== editorRef.current.innerHTML
    ) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isEditorReady]);

  // إغلاق منتقي الألوان عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".color-picker-container")) {
        setShowColorPicker(false);
        setShowBgColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);

      // Update word and character count
      const text = editorRef.current.innerText || '';
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  };

  const clearContent = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setCharCount(0);
      setWordCount(0);
      handleInput();
      editorRef.current.focus();
    }
  };

  const execCommand = (command, value = null) => {
    try {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleInput();
    } catch (error) {}
  };

  const insertLink = () => {
    try {
      const url = prompt("أدخل الرابط:", "https://");
      if (url && url !== "https://") {
        const linkText = prompt("أدخل نص الرابط:", url);
        if (linkText) {
          const linkHtml = `<a href="${url}" target="_blank">${linkText}</a>`;
          execCommand("insertHTML", linkHtml);
        }
      }
    } catch (error) {}
  };

  const insertImage = () => {
    try {
      const url = prompt("أدخل رابط الصورة:", "https://");
      if (url && url !== "https://") {
        const alt = prompt("أدخل وصف الصورة (اختياري):", "");
        const imageHtml = `<img src="${url}" alt="${
          alt || ""
        }" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
        execCommand("insertHTML", imageHtml);
      }
    } catch (error) {}
  };

  const insertTable = () => {
    const rows = prompt("عدد الصفوف:", "3");
    const cols = prompt("عدد الأعمدة:", "3");
    if (rows && cols && parseInt(rows) > 0 && parseInt(cols) > 0) {
      let tableHtml =
        '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHtml += "<tr>";
        for (let j = 0; j < parseInt(cols); j++) {
          tableHtml +=
            '<td style="padding: 8px; border: 1px solid #ddd;">&nbsp;</td>';
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</table>";
      execCommand("insertHTML", tableHtml);
    }
  };

  const formatBlock = (tag) => {
    execCommand("formatBlock", tag);
  };

  const changeFontSize = (size) => {
    const numSize = parseInt(size);
    if (isNaN(numSize) || numSize < 8 || numSize > 72) return;
    setCurrentFontSize(size);

    try {
      // Use CSS styling instead of execCommand for better reliability
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.extractContents();

        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        span.appendChild(selectedText);
        range.insertNode(span);

        // Clean up: if span has similar styled siblings, merge them
        const parent = span.parentNode;
        if (parent) {
          const siblings = Array.from(parent.children);
          siblings.forEach(sibling => {
            if (sibling !== span && sibling.tagName === 'SPAN' &&
                sibling.style.fontSize === span.style.fontSize) {
              span.appendChild(sibling);
              sibling.remove();
            }
          });
        }

        handleInput();
      }
    } catch (e) {
      console.warn('Failed to set font size with CSS method, falling back to execCommand');
      try {
        execCommand("fontSize", size);
      } catch (e2) {}
    }
  };

  const increaseFontSize = () => {
    const current = parseInt(currentFontSize);
    const newSize = Math.min(current + 2, 72); // Max 72px
    changeFontSize(newSize.toString());
  };

  const decreaseFontSize = () => {
    const current = parseInt(currentFontSize);
    const newSize = Math.max(current - 2, 8); // Min 8px
    changeFontSize(newSize.toString());
  };

  const changeFontFamily = (font) => {
    setCurrentFontFamily(font);
    execCommand("fontName", font);
  };

  const changeTextColor = (color) => {
    execCommand("foreColor", color);
    setShowColorPicker(false);
  };

  const changeBackgroundColor = (color) => {
    execCommand("backColor", color);
    setShowBgColorPicker(false);
  };

  const toolbarButtons = [
    {
      icon: FaBold,
      command: "bold",
      title: "عريض (Ctrl+B)",
      shortcut: "Ctrl+B",
    },
    {
      icon: FaItalic,
      command: "italic",
      title: "مائل (Ctrl+I)",
      shortcut: "Ctrl+I",
    },
    {
      icon: FaUnderline,
      command: "underline",
      title: "تحته خط (Ctrl+U)",
      shortcut: "Ctrl+U",
    },
    {
      icon: FaStrikethrough,
      command: "strikeThrough",
      title: "يتوسطه خط",
    },
    {
      icon: FaSubscript,
      command: "subscript",
      title: "منخفض",
    },
    {
      icon: FaSuperscript,
      command: "superscript",
      title: "مرتفع",
    },
  ];

  const alignmentButtons = [
    {
      icon: FaAlignRight,
      command: "justifyRight",
      title: "محاذاة يمين",
    },
    {
      icon: FaAlignCenter,
      command: "justifyCenter",
      title: "محاذاة وسط",
    },
    {
      icon: FaAlignLeft,
      command: "justifyLeft",
      title: "محاذاة يسار",
    },
    {
      icon: FaAlignJustify,
      command: "justifyFull",
      title: "ضبط",
    },
  ];

  const listButtons = [
    {
      icon: FaListUl,
      command: "insertUnorderedList",
      title: "قائمة نقطية",
    },
    {
      icon: FaListOl,
      command: "insertOrderedList",
      title: "قائمة مرقمة",
    },
    {
      icon: FaIndent,
      command: "indent",
      title: "زيادة المسافة البادئة",
    },
    {
      icon: FaOutdent,
      command: "outdent",
      title: "تقليل المسافة البادئة",
    },
  ];

  const formatOptions = [
    { value: "div", label: "عادي" },
    { value: "h1", label: "عنوان 1" },
    { value: "h2", label: "عنوان 2" },
    { value: "h3", label: "عنوان 3" },
    { value: "h4", label: "عنوان 4" },
    { value: "h5", label: "عنوان 5" },
    { value: "h6", label: "عنوان 6" },
    { value: "p", label: "فقرة" },
    { value: "blockquote", label: "اقتباس" },
    { value: "pre", label: "كود" },
  ];

  const fontSizes = [
    8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
  ];

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Comic Sans MS",
    "Trebuchet MS",
    "Arial Black",
    "Impact",
    "Tahoma",
    "Cairo",
    "Amiri",
    "Noto Sans Arabic",
  ];

  const predefinedColors = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#FF0000",
    "#FF6600",
    "#FFCC00",
    "#FFFF00",
    "#CCFF00",
    "#66FF00",
    "#00FF00",
    "#00FF66",
    "#00FFCC",
    "#00FFFF",
    "#00CCFF",
    "#0066FF",
    "#0000FF",
    "#6600FF",
    "#CC00FF",
    "#FF00FF",
    "#FF00CC",
    "#FF0066",
    "#800000",
    "#804000",
    "#808000",
    "#408000",
    "#008000",
    "#008040",
    "#008080",
    "#004080",
    "#000080",
    "#400080",
    "#800080",
    "#800040",
  ];

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
        case "z":
          e.preventDefault();
          execCommand("undo");
          break;
        case "y":
          e.preventDefault();
          execCommand("redo");
          break;
        case "k":
          e.preventDefault();
          insertLink();
          break;
      }
    }
  };

  return (
    <div className={styles.editorContainer}>
      {/* شريط الأدوات */}
      <div className={styles.toolbar}>
        {/* الصف الأول - التنسيق الأساسي */}
        <div className="flex flex-wrap items-center gap-1 mb-2">
          {/* قائمة التنسيق */}
          <select
            onChange={(e) => formatBlock(e.target.value)}
            className={styles.toolbarSelect}
            defaultValue=""
          >
            <option value="" disabled>
              تنسيق
            </option>
            {formatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* أدوات حجم الخط */}
          <div className="flex items-center gap-1">
            {/* حجم الخط */}
            <select
              value={currentFontSize}
              onChange={(e) => changeFontSize(e.target.value)}
              className={styles.toolbarSelect}
              style={{ width: "80px" }}
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>

            {/* زر تقليل حجم الخط */}
            <button
              type="button"
              onClick={decreaseFontSize}
              className={styles.toolbarButton}
              title="تقليل حجم الخط"
              disabled={parseInt(currentFontSize) <= 8}
            >
              <FaMinus size={12} />
            </button>

            {/* زر زيادة حجم الخط */}
            <button
              type="button"
              onClick={increaseFontSize}
              className={styles.toolbarButton}
              title="زيادة حجم الخط"
              disabled={parseInt(currentFontSize) >= 72}
            >
              <FaPlus size={12} />
            </button>
          </div>

          {/* نوع الخط */}
          <select
            value={currentFontFamily}
            onChange={(e) => changeFontFamily(e.target.value)}
            className={styles.toolbarSelect}
            style={{ minWidth: "120px" }}
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>

          <div className={styles.divider} />

          {/* أزرار التنسيق الأساسي */}
          {toolbarButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={button.action || (() => execCommand(button.command))}
                className={styles.toolbarButton}
                title={button.title}
              >
                <Icon size={14} />
              </button>
            );
          })}

          <div className={styles.divider} />

          {/* منتقي الألوان */}
          <div className="relative color-picker-container">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={styles.toolbarButton}
              title="لون النص"
            >
              <FaFont size={14} />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10 color-picker-container">
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => changeTextColor(color)}
                      className="w-6 h-6 border border-gray-300 rounded hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  onChange={(e) => changeTextColor(e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                  title="اختر لون مخصص"
                />
              </div>
            )}
          </div>

          {/* منتقي لون الخلفية */}
          <div className="relative color-picker-container">
            <button
              type="button"
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              className={styles.toolbarButton}
              title="لون الخلفية"
            >
              <FaHighlighter size={14} />
            </button>
            {showBgColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10 color-picker-container">
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => changeBackgroundColor(color)}
                      className="w-6 h-6 border border-gray-300 rounded hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  onChange={(e) => changeBackgroundColor(e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                  title="اختر لون خلفية مخصص"
                />
              </div>
            )}
          </div>
        </div>

        {/* الصف الثاني - المحاذاة والقوائم */}
        <div className="flex flex-wrap items-center gap-1">
          {/* أزرار المحاذاة */}
          {alignmentButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={() => execCommand(button.command)}
                className={styles.toolbarButton}
                title={button.title}
              >
                <Icon size={14} />
              </button>
            );
          })}

          <div className={styles.divider} />

          {/* أزرار القوائم والمسافة البادئة */}
          {listButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={() => execCommand(button.command)}
                className={styles.toolbarButton}
                title={button.title}
              >
                <Icon size={14} />
              </button>
            );
          })}

          <div className={styles.divider} />

          {/* أزرار الروابط والوسائط */}
          <button
            type="button"
            onClick={insertLink}
            className={styles.toolbarButton}
            title="إدراج رابط"
          >
            <FaLink size={14} />
          </button>

          <button
            type="button"
            onClick={() => execCommand("unlink")}
            className={styles.toolbarButton}
            title="إزالة الرابط"
          >
            <FaUnlink size={14} />
          </button>

          <button
            type="button"
            onClick={insertImage}
            className={styles.toolbarButton}
            title="إدراج صورة"
          >
            <FaImage size={14} />
          </button>

          <button
            type="button"
            onClick={insertTable}
            className={styles.toolbarButton}
            title="إدراج جدول"
          >
            <FaTable size={14} />
          </button>

          <div className={styles.divider} />

          {/* أزرار إضافية */}
          <button
            type="button"
            onClick={() => formatBlock("blockquote")}
            className={styles.toolbarButton}
            title="اقتباس"
          >
            <FaQuoteRight size={14} />
          </button>

          <button
            type="button"
            onClick={() => formatBlock("pre")}
            className={styles.toolbarButton}
            title="كود"
          >
            <FaCode size={14} />
          </button>

          <button
            type="button"
            onClick={() => execCommand("removeFormat")}
            className={styles.toolbarButton}
            title="إزالة التنسيق"
          >
            <FaRemoveFormat size={14} />
          </button>

          <div className={styles.divider} />

          {/* أزرار التراجع والإعادة */}
          <button
            type="button"
            onClick={() => execCommand("undo")}
            className={styles.toolbarButton}
            title="تراجع (Ctrl+Z)"
          >
            <FaUndo size={14} />
          </button>

          <button
            type="button"
            onClick={() => execCommand("redo")}
            className={styles.toolbarButton}
            title="إعادة (Ctrl+Y)"
          >
            <FaRedo size={14} />
          </button>
        </div>
      </div>

      {/* منطقة التحرير */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        onKeyDown={handleKeyDown}
        className={styles.editorContent}
        style={{
          direction: "rtl",
          textAlign: "right",
          fontFamily: currentFontFamily,
          fontSize: currentFontSize + "px",
        }}
        placeholder="ابدأ الكتابة هنا..."
        suppressContentEditableWarning={true}
      />

      {/* إحصائيات وأزرار إضافية */}
      <div className={styles.editorFooter}>
        <div className={styles.editorStats}>
          <span>كلمات: {wordCount}</span>
          <span>حروف: {charCount}</span>
        </div>
        <div className={styles.editorActions}>
          <button
            type="button"
            onClick={clearContent}
            className={`${styles.toolbarButton} ${styles.dangerButton}`}
            title="مسح المحتوى"
          >
            <FaTrash size={14} />
            <span>مسح</span>
          </button>
          <div className={styles.shortcutsList}>
            <span>Ctrl+B: عريض</span>
            <span>Ctrl+I: مائل</span>
            <span>Ctrl+U: تحته خط</span>
            <span>Ctrl+K: رابط</span>
          </div>
        </div>
      </div>
    </div>
  );
}
