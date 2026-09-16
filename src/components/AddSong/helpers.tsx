import * as z from "zod";
import { scripts, languageCodes } from "../../types/languageCodes";

// format correctly for select options
export type SelectOption = {
  value: string;
  label: string;
};

export const languageOptions: SelectOption[] = Object.entries(languageCodes).map(
  ([label, value]) => ({
    label,
    value,
  })
);

export const scriptOptions: SelectOption[] = Object.entries(scripts).map(
    ([value, label]) => ({
    value,
        label,
  })
);

// define fields of the add song form
export const addSongValuesSchema = z.object({
    artist_name: z.string().nonempty(),
    artist_eng_name: z.string().nonempty(),
    orig_title: z.string().nonempty(),
    eng_title: z.string(),
    language: z.string().nonempty(),
    script: z.string().length(2),
    album: z.string(),
    yt_id: z.string().length(11)
}).refine((data) => Object.keys(scripts).includes(data.script), {
        message: "Please choose a supported script",
        path: ["script"]
}).refine((data) => Object.keys(languageCodes).includes(data.language), {
    message: "Please choose a supported language",
    path: ["language"]
});

export type AddSongValues = z.infer<typeof addSongValuesSchema>

export type Artist = {
  artist_id: number;
  artist_name: string;
  artist_eng_name: string | null;
};

export type SubmissionStatus = {
    type: "loading" | "success" | "error";
    message: string;
};