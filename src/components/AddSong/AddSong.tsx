import "./AddSong.css";
import * as z from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from "react-hook-form";
import { scripts, languageCodes } from "../../types/languageCodes";
import { Button } from "@mui/material";
import { ErrorText } from "../ErrorText/ErrorText";
import { FormInputLine } from "../FormInputLine";
import Select from "react-select";

// format correctly for select options
type SelectOption = {
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
const addSongValuesSchema = z.object({
    artist_name: z.string().nonempty(),
    artist_eng_name: z.string(),
    orig_title: z.string().nonempty(),
    eng_title: z.string(),
    language: z.string().nonempty(),
    script: z.string().length(2),
    album: z.string(),
    yt_id: z.string().length(11)
}).refine((data) => Object.keys(scripts).includes(data.script), {
        message: "Please choose a supported script",
        path: ["script"]
}).refine((data) => Object.values(languageCodes).includes(data.language), {
    message: "Please choose a supported language",
    path: ["language"]
});

type AddSongValues = z.infer<typeof addSongValuesSchema>

export function AddSong() {
    const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting }} = useForm<AddSongValues>({
        resolver: zodResolver(addSongValuesSchema)
    })

    const submitForm = (data: AddSongValues) => {
        console.log(data);
    }

    return (
        <>
            <h1>Add new song</h1>

            <form className="add-song-form" onSubmit={handleSubmit(submitForm)} id="add-song-form">
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Artist Name" 
                    field="artist_name" 
                    placeholder="Enter artist name (in original language)"
                />
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Artist Name - English (optional)" 
                    field="artist_eng_name" 
                    placeholder="Enter artist name (in English)"
                />
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Song Title" 
                    field="orig_title" 
                    placeholder="Enter song title (in original language)"
                />
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Song Title - English (optional)" 
                    field="eng_title" 
                    placeholder="Enter song title (in English)"
                />
                <div className="form-select-container">
                    <p>Language</p>
                    <Controller
                        name="language"
                        control={control}
                        rules={{ required: "Song Language is required"}}
                        render={({field}) => (
                            <>
                                <Select className="form-select" 
                                    options={languageOptions}
                                    value={ languageOptions.find( (option) => option.value === field.value ) ?? null }
                                    // convert { label, value } back to "en", "ja", etc. 
                                    onChange={(option) => { field.onChange(option?.value ?? ''); }}
                                    placeholder="Select language"
                                />
                                <ErrorText msg={errors.language?.message}/>
                            </>
                            
                        )}
                    />
                </div>
                <div className="form-select-container">
                    <p>Script</p>
                    <Controller
                        name="script"
                        control={control}
                        rules={{ required: "Song script is required"}}
                        render={({field}) => (
                            <>
                                <Select 
                                    className="form-select" 
                                    options={scriptOptions} 
                                    value={ scriptOptions.find( (option) => option.value === field.value ) ?? null }
                                    onChange={(option) => { field.onChange(option?.value ?? ''); }}
                                    onBlur={field.onBlur} 
                                    placeholder="Select script..."
                                />
                                <ErrorText msg={errors.script?.message}/>
                            </>
                        )}
                    />
                </div>
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Album (optional)" 
                    field="album" 
                    placeholder="Enter name of album"
                />
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Youtube Video ID" 
                    field="yt_id" 
                    placeholder="Select correct audio or enter YouTube video id"
                />
            </form>
            <Button
                className="submit-button"
                type="submit"
                loading={isSubmitting}
                form="add-song-form">
                Add New Song
            </Button>
        </>
    )
}