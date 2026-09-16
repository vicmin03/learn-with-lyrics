import "./AddSong.css";
import { useState, useEffect } from "react";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from "react-hook-form";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { ErrorText } from "../ErrorText/ErrorText";
import { FormInputLine } from "../FormInputLine";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { supabase } from "../../lib/supabaseClient";
import { FiUpload } from "react-icons/fi";
import { addSongValuesSchema, AddSongValues, Artist, SelectOption, languageOptions, scriptOptions, SubmissionStatus } from "./helpers";


export function AddSong() {
    const { register, control, handleSubmit, setValue, reset, formState: { errors, isSubmitting }} = useForm<AddSongValues>({
        resolver: zodResolver(addSongValuesSchema)
    })


    // load artist names from supabase table for select 
    const [artistOptions, setArtistOptions] = useState<SelectOption[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [isArtistEnglishNameDisabled, setIsArtistEnglishNameDisabled] = useState(false);

    // track artistId of an existing artist if selected
    const [currentArtistId, setCurrentArtistId] = useState<number | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);

    // for uploading cover image
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverInputKey, setCoverInputKey] = useState(0);

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

    const createSong = async (data: AddSongValues, artist_id: number, cover_url: string | null) => {
        const result = await supabase?.from("Songs").insert({
            orig_title: data.orig_title,
            eng_title: data.eng_title, 
            artist_id: artist_id,
            cover_url,
            language: data.language, 
            orig_script: data.script, 
            yt_id: data.yt_id,
            album: data.album,
        });

        if (result?.error) {
            console.error('Failed to create song:', result.error);
            return false;
        }

        return true;
    }

    // upload image to supabase storage in bucket song-covers
    const uploadImage = async (file: File) : Promise<string | null> => {
        if (!supabase) {
            return null;
        }

        const fileName = `${file.name}-${file.lastModified}-${file.size}`

        const result = await supabase?.storage.from("song-covers").upload(fileName, file);

        if (result?.error) {
            console.error("Error uploading image: ", result.error.message);
            return null;
        }

        const { data } = await supabase.storage.from("song-covers").getPublicUrl(fileName);
        
        return data.publicUrl;

    }

    // upload new (artist and) song, including uploading cover image to supabase storage and retrieving correct url for image
    const submitForm = async (data: AddSongValues) => {
        setSubmissionStatus({ type: "loading", message: "Adding song..." });
        let artistId = currentArtistId;

        // if new artist, add them first and retrieve artist id
        if (artistId === null) {
            artistId = await createArtist(data.artist_name, data.artist_eng_name, data.language);
        }

        if (artistId === null) {
            setSubmissionStatus({ type: "error", message: "The artist could not be created. Please try again." });
            return;
        }

        // upload cover image to supabase storage
        let imageUrl: string | null = null;
        if (coverImage) {
            imageUrl = await uploadImage(coverImage);
            if (imageUrl === null) {
                setSubmissionStatus({ type: "error", message: "The cover image could not be uploaded. Please try again." });
                return;
            }
        }

        // create song with the selected or newly created artist id
        const songCreated = await createSong(data, artistId, imageUrl);
        if (!songCreated) {
            setSubmissionStatus({ type: "error", message: "The song could not be created. Please try again." });
            return;
        }

        const successMessage = `The song "${data.orig_title} - ${data.artist_name}" was added successfully.`;
        reset();
        setCurrentArtistId(null);
        setIsArtistEnglishNameDisabled(false);
        setCoverImage(null);
        setCoverInputKey((key) => key + 1);
        setSubmissionStatus({ type: "success", message: successMessage });
        console.log("ADDED NEW SONG", data);
    }

    // handle uploading images
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCoverImage(e.target.files[0])
        }
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
                                    isDisabled={isSubmitting}
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
                    disabled={isSubmitting || isArtistEnglishNameDisabled}
                />
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Song Title" 
                    field="orig_title" 
                    placeholder="Enter song title (in original language)"
                    disabled={isSubmitting}
                />
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Song Title - English (optional)" 
                    field="eng_title" 
                    placeholder="Enter song title (in English)"
                    disabled={isSubmitting}
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
                                    isDisabled={isSubmitting}
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
                                    isDisabled={isSubmitting}
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
                    disabled={isSubmitting}
                />
                <FormInputLine 
                    register={register} 
                    errors={errors}
                    label="Youtube Video ID" 
                    field="yt_id" 
                    placeholder="Select correct audio or enter YouTube video id"
                    disabled={isSubmitting}
                />
                <div className="form-select-container">
                    <p className="form-label">Cover Image</p>
                    <div className="file-input-wrapper">
                        <input 
                            className="file-input"
                            id="cover-image-input"
                            key={coverInputKey} 
                            type="file"
                            accept="image/*" 
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                        />
                        <label className="file-input-label" htmlFor="cover-image-input">
                            <span className={!coverImage ? "file-input-placeholder" : undefined}>
                                {coverImage?.name ?? "Choose cover image"}
                            </span>
                            <FiUpload className="file-input-icon" aria-hidden="true" />
                        </label>
                    </div>
                </div>
           
                
                
            </form>
            <Button
                className="submit-button"
                type="submit"
                loading={isSubmitting}
                loadingIndicator={
                <CircularProgress
                    size={20}
                    sx={{ color: "white" }}
                    />
                }
                form="add-song-form">
                Add New Song
            </Button>
            <Dialog
                className="dialog"
                open={submissionStatus !== null}
                onClose={() => {
                    if (!isSubmitting) {
                        setSubmissionStatus(null);
                    }
                }}
            >
                <DialogTitle>
                    {submissionStatus?.type === "success" ? "Song added" : submissionStatus?.type === "error" ? "Song not added" : "Adding song"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>{submissionStatus?.message}</DialogContentText>
                </DialogContent>
                {!isSubmitting && (
                    <DialogActions>
                        <Button onClick={() => setSubmissionStatus(null)}>Close</Button>
                    </DialogActions>
                )}
            </Dialog>
        </>
    )
}