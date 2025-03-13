import { useLanguage } from "@/i18n/LanguageContext";
import { getAvailableLanguages } from "@/i18n";
import { useTranslation } from "@/hooks/use-translation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  variant?: "select" | "buttons" | "minimal";
  className?: string;
}

export function LanguageSelector({ variant = "select", className = "" }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const languages = getAvailableLanguages();
  const [isOpen, setIsOpen] = useState(false);

  // Find the current language name
  const currentLanguageName = languages.find(lang => lang.code === language)?.name || language;

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as "en" | "tr");
  };

  if (variant === "select") {
    return (
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-32 ${className}`}>
          <Globe className="mr-2 h-4 w-4" />
          <SelectValue>{currentLanguageName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code || "en"}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === "buttons") {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={lang.code === language ? "default" : "outline"}
            size="sm"
            onClick={() => handleLanguageChange(lang.code)}
          >
            {lang.name}
          </Button>
        ))}
      </div>
    );
  }

  // Minimal variant (just the icon and a dropdown)
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('settings.language')}
      >
        <Globe className="h-5 w-5" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  lang.code === language 
                    ? 'bg-gray-100 text-gray-900 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  handleLanguageChange(lang.code);
                  setIsOpen(false);
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}