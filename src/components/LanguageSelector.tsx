import { LANGUAGES, LanguageCode } from "@/lib/translations";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(val) => setLanguage(val as LanguageCode)}>
      <SelectTrigger aria-label="Choisir la langue" className="w-auto gap-2 border-primary/20 bg-card/80 backdrop-blur-sm">
        <SelectValue>
          {LANGUAGES.find((l) => l.code === language)?.flag}{" "}
          {LANGUAGES.find((l) => l.code === language)?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
