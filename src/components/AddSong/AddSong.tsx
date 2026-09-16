import "./AddSong.css";
import { useState, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from "react-hook-form";
import { scripts, languageCodes } from "../../types/languageCodes";
import { Button } from "@mui/material";
import { ErrorText } from "../ErrorText/ErrorText";
import { FormInputLine } from "../FormInputLine";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { supabase } from "../../lib/supabaseClient";

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
    // artist_id: z.number(),
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

type AddSongValues = z.infer<typeof addSongValuesSchema>

type Artist = {
  artist_id: number;
  artist_name: string;
  artist_eng_name: string | null;
};


export function AddSong() {
    const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting }} = useForm<AddSongValues>({
        resolver: zodResolver(addSongValuesSchema)
    })


    // load artist names from supabase table for select 
    const [artistOptions, setArtistOptions] = useState<SelectOption[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [isArtistEnglishNameDisabled, setIsArtistEnglishNameDisabled] = useState(false);

    // track artistId of an existing artist if selected
    const [currentArtistId, setCurrentArtistId] = useState<number | null>(null);

    useEffect(() => {
        const getArtists = async() => {
            const result = await supabase?.from("Artists").select("artist_id, artist_name, artist_eng_name")

            if (result?.error) { 
                console.error('Failed to load artists:', result.error); 
                return; 
            }

            if (result?.data) {
                const options = result.data.map((artist) => ({
                    value: artist.artist_id, 
                    label: artist.artist_name
                }))
                setArtistOptions(options);
                setArtists(result.data);
            }
        }

        getArtists();

    }, [])

    // handle creating a new artist in supabase
    const createArtist = async (artist_name: string, artist_eng_name: string, lang: string) => {
        const result = await supabase?.from("Artists").insert({
            artist_name: artist_name,
            artist_eng_name: artist_eng_name,
            language: lang
        }).select("artist_id").single();

        if (result?.error) { 
            console.error('Failed to create new artist:', result.error); 
            return null;
        }
        if (result?.data) {
            console.log("ADDED NEW ARTIST: ", result.data);
            return result.data.artist_id;
        }
        return null;
    }

    const createSong = async (data: AddSongValues, artist_id: number) => {
        const result = await supabase?.from("Songs").insert({
            orig_title: data.orig_title,
            eng_title: data.eng_title, 
            artist_id: artist_id,
            // cover_url: data.cover_url,
            language: data.language, 
            orig_script: data.script, 
            yt_id: data.yt_id,
            album: data.album,
        });
    }

    const submitForm = async (data: AddSongValues) => {
        let artistId = currentArtistId;

        // if new artist, add them first and retrieve artist id
        if (artistId === null) {
            artistId = await createArtist(data.artist_name, data.artist_eng_name, data.language);
        }

        if (artistId === null) {
            return;
        }

        // create song with the selected or newly created artist id
        await createSong(data, artistId);

        console.log("ADDED NEW SONG", data);
    }

    return (
        <>
            <h1>Add new song</h1>

            <form className="add-song-form" onSubmit={handleSubmit(submitForm)} id="add-song-form">
                <div className="form-select-container">
                    <p className="form-label">Artist Name</p>
                    <Controller
                        name="artist_name"
                        control={control}
                        render={({field}) => (
                            <>
                                <CreatableSelect 
                                    className="form-select" 
                                    classNamePrefix="form-select"
                                    isClearable
                                    options={artistOptions}
                                    value={artistOptions.find( (option) => option.label === field.value ) ?? (field.value ? { value: field.value, label: field.value } : null)}
                                    onChange={(option) => {
                                        if (!option) {
                                            field.onChange('');
                                            setValue('artist_eng_name', '');
                                            setIsArtistEnglishNameDisabled(false);
                                            setCurrentArtistId(null);
                                            return;
                                        }
                                        // find existing artist's english name 
                                        const artist = artists.find(
                                            (artist) => artist.artist_name === option.label
                                        );
                                        field.onChange(option.label);
                                        setValue("artist_eng_name", artist?.artist_eng_name ?? "");
                                        setCurrentArtistId(artist?.artist_id ?? null);
                                        setIsArtistEnglishNameDisabled(Boolean(artist?.artist_eng_name));
                                    }}     
                                    placeholder="Select an artist"
                                    onBlur={field.onBlur}     
                                />
                                <ErrorText msg={errors.artist_name?.message}/>
                            </>
                        )}
                    />
                </div>
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Artist Name - English" 
                    field="artist_eng_name" 
                    placeholder="Enter artist name (in English)"
                    disabled={isArtistEnglishNameDisabled}
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
                    <p className="form-label">Language</p>
                    <Controller
                        name="language"
                        control={control}
                        rules={{ required: "Song Language is required"}}
                        render={({field}) => (
                            <>
                                <Select 
                                    className="form-select" 
                                    classNamePrefix="form-select"
                                    options={languageOptions}
                                    value={ languageOptions.find( (option) => option.label === field.value ) ?? null } 
                                    onChange={(option) => { field.onChange(option?.label ?? ''); }}
                                    placeholder="Select language"
                                />
                                <ErrorText msg={errors.language?.message}/>
                            </>
                            
                        )}
                    />
                </div>
                <div className="form-select-container">
                    <p className="form-label">Script</p>
                    <Controller
                        name="script"
                        control={control}
                        rules={{ required: "Song script is required"}}
                        render={({field}) => (
                            <>
                                <Select 
                                    className="form-select" 
                                    classNamePrefix="form-select"
                                    options={scriptOptions} 
                                    value={ scriptOptions.find( (option) => option.value === field.value ) ?? null }
                                    // convert from label back to value (e.g. Simplified -> ch)
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