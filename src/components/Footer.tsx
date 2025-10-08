"use client";

export default function Footer() {
    return (
      <footer className="mt-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-center">
            <p className="text-sm text-gray-500">
              Copyright © {new Date().getFullYear()} Duyur!
            </p>
          </div>
        </div>
      </footer>
    );
  }