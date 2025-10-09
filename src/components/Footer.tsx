"use client";

export default function Footer() {
    return (
      <footer className="mt-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">
              Copyright © {new Date().getFullYear()} Duyur! • İletişim:{" "}
              <a 
                href="mailto:info@duyur.social"
                className="text-blue-500 hover:underline"
              >
                info@duyur.social
              </a>
            </p>
            <p className="text-xs text-gray-400">
              Bu site reCAPTCHA ile korunmaktadır ve Google{" "}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Gizlilik Politikası
              </a>
              {" "}ve{" "}
              <a 
                href="https://policies.google.com/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Hizmet Şartları
              </a>
              {" "}geçerlidir.
            </p>
          </div>
        </div>
      </footer>
    );
  }