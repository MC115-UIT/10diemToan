"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, MoreVertical, Edit2, Trash2, Check, X } from "lucide-react";
import { Conversation } from "@/types";
import { renameConversation, deleteConversation } from "@/lib/chatApi";

interface Props {
    conversation: Conversation;
    onUpdate: () => void;
}

export function ConversationItem({ conversation, onUpdate }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(conversation.title || "Giải Thuật Toán Học");
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const isActive = pathname.includes(conversation.id);

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Autofocus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleRenameSubmit = async () => {
        if (!editTitle.trim() || editTitle === conversation.title) {
            setIsEditing(false);
            return;
        }
        try {
            await renameConversation(conversation.id, editTitle);
            setIsEditing(false);
            onUpdate();
        } catch (err) {
            console.error("Failed to rename conversation", err);
            alert("Failed to rename conversation");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleRenameSubmit();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setEditTitle(conversation.title || "Giải Thuật Toán Học");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa đoạn chat này không?")) return;
        setIsDeleting(true);
        try {
            await deleteConversation(conversation.id);
            onUpdate();
            if (isActive) {
                router.push("/chat");
            }
        } catch (err) {
            console.error("Failed to delete conversation", err);
            setIsDeleting(false);
            alert("Failed to delete conversation");
        }
    };

    if (isDeleting) return null;

    return (
        <div
            className={`group relative flex items-center justify-between rounded-sm transition-colors ${isActive
                    ? "bg-[#F2EFE9] text-academic-accent font-bold border-l-2 border-academic-accent"
                    : "text-academic-neutral hover:bg-[#F2EFE9] border-l-2 border-transparent hover:text-academic-ink"
                }`}
        >
            <div className="flex flex-1 items-center gap-3 overflow-hidden px-3 py-2">
                <MessageSquare size={18} className="opacity-70 shrink-0" />
                {isEditing ? (
                    <div className="flex items-center gap-1 w-full">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-white border border-academic-accent rounded px-1 text-sm outline-none text-academic-ink font-normal"
                        />
                        <button onClick={handleRenameSubmit} className="text-green-600 hover:bg-green-50 rounded">
                            <Check size={16} />
                        </button>
                        <button onClick={() => { setIsEditing(false); setEditTitle(conversation.title || ""); }} className="text-red-600 hover:bg-red-50 rounded">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <Link href={`/chat/${conversation.id}`} className="truncate w-full text-left outline-none block py-1">
                        <span className="truncate block">{conversation.title || "Giải Thuật Toán Học"}</span>
                    </Link>
                )}
            </div>

            {!isEditing && (
                <div className="relative pr-2 shrink-0" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className={`p-1 rounded-md text-academic-neutral hover:text-academic-ink transition-opacity ${showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-academic-border shadow-md rounded-md z-50 overflow-hidden font-normal text-sm text-academic-ink">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    setIsEditing(true);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-academic-paper transition-colors"
                            >
                                <Edit2 size={14} />
                                <span>Đổi tên</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    handleDelete();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#FDF2F2] text-academic-warning transition-colors"
                            >
                                <Trash2 size={14} />
                                <span>Xóa</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
