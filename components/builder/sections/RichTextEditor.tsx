"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing here...",
  maxLength = 5000,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      CharacterCount.configure({ limit: maxLength }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Prevent empty paragraphs from being added
      const cleanHtml = html
        .replace(/<p><\/p>/g, "")
        .replace(/<p>\s*<\/p>/g, "");
      onChange(cleanHtml);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert p-2 min-h-[150px] outline-none leading-tight",
      },
    },
  });

  // Sync external value - prevent infinite loops
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML();
      // Only update if the value is actually different and not empty
      if (currentContent !== value && value !== null) {
        editor.commands.setContent(value || "", { emitUpdate: false });
      }
    }
  }, [editor, value]);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    icon: Icon,
    onClick,
    title,
    isActive,
  }: {
    icon: any;
    onClick: () => void;
    title: string;
    isActive?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-400"
      }`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        {/* Text Styles */}
        <ToolbarButton
          icon={Bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          isActive={editor.isActive("bold")}
        />
        <ToolbarButton
          icon={Italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          isActive={editor.isActive("italic")}
        />
        <ToolbarButton
          icon={UnderlineIcon}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
          isActive={editor.isActive("underline")}
        />
        <ToolbarButton
          icon={Quote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          isActive={editor.isActive("blockquote")}
        />
        <ToolbarButton
          icon={Code}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
          isActive={editor.isActive("codeBlock")}
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          icon={AlignLeft}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align Left"
          isActive={editor.isActive({ textAlign: "left" })}
        />
        <ToolbarButton
          icon={AlignCenter}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align Center"
          isActive={editor.isActive({ textAlign: "center" })}
        />
        <ToolbarButton
          icon={AlignRight}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align Right"
          isActive={editor.isActive({ textAlign: "right" })}
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Lists */}
        <ToolbarButton
          icon={List}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          isActive={editor.isActive("bulletList")}
        />
        <ToolbarButton
          icon={ListOrdered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
          isActive={editor.isActive("orderedList")}
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Links & Media */}
        <ToolbarButton
          icon={LinkIcon}
          onClick={insertLink}
          title="Insert Link"
          isActive={editor.isActive("link")}
        />
        <ToolbarButton
          icon={ImageIcon}
          onClick={insertImage}
          title="Insert Image"
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* History */}
        <ToolbarButton
          icon={Undo}
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        />
        <ToolbarButton
          icon={Redo}
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        />
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="bg-white dark:bg-gray-800 px-3 py-2"
      />

      {/* Character Count */}
      <div className="text-right text-xs text-gray-500 dark:text-gray-400 p-2">
        {editor.storage.characterCount.characters()} / {maxLength} characters
      </div>
    </div>
  );
}
