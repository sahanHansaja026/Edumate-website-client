"use client";

import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { getUser } from "@/app/services/authService";
import { API_BASE_URL } from "@/app/config/api";

type FormData = {
  username: string;
  about: string;
  firstName: string;
  lastName: string;
  country: string;
  streetAddress: string;
  city: string;
  region: string;
  postalCode: string;
  notifications: {
    comments: boolean;
    candidates: boolean;
    offers: boolean;
    push: "everything" | "email" | "none";
  };
  photo?: File;
  coverPhoto?: File;
};

export default function ProfileForm() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [loading, setLoading] = useState(true); // show loading while fetching

  const [formData, setFormData] = useState<FormData>({
    username: "",
    about: "",
    firstName: "",
    lastName: "",
    country: "United States",
    streetAddress: "",
    city: "",
    region: "",
    postalCode: "",
    notifications: {
      comments: true,
      candidates: false,
      offers: false,
      push: "everything",
    },
  });

  /* --- Load current user and profile --- */
  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  
    if (!currentUser) return;
  
    // Fetch profile by email
    fetch(`${API_BASE_URL}/profiles/?email=${currentUser.email}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profile not found");
        return res.json();
      })
      .then((profile) => {
        if (!profile) return;
  
        // Populate form
        setFormData({
          username: profile.username || "",
          about: profile.about || "",
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          country: profile.country || "United States",
          streetAddress: profile.streetAddress || "",
          city: profile.city || "",
          region: profile.region || "",
          postalCode: profile.postalCode || "",
          notifications: {
            comments: profile.notifications.comments,
            candidates: profile.notifications.candidates,
            offers: profile.notifications.offers,
            push: profile.notifications.push || "everything",
          },
        });
  
        // Photos
        if (profile.photo) setPhotoPreview(`data:image/jpeg;base64,${profile.photo}`);
        if (profile.coverPhoto) setCoverPreview(`data:image/jpeg;base64,${profile.coverPhoto}`);
      })
      .catch((err) => console.error("Error fetching profile:", err))
      .finally(() => setLoading(false));
  }, []);
  

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    const file = files[0];
    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({ ...prev, [name]: file }));

    if (name === "photo") setPhotoPreview(previewUrl);
    if (name === "coverPhoto") setCoverPreview(previewUrl);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return alert("User not loaded");

    const form = new FormData();
    form.append("username", formData.username);
    form.append("about", formData.about);
    form.append("firstName", formData.firstName);
    form.append("lastName", formData.lastName);
    form.append("email", user.email);
    form.append("country", formData.country);
    form.append("streetAddress", formData.streetAddress);
    form.append("city", formData.city);
    form.append("region", formData.region);
    form.append("postalCode", formData.postalCode);

    form.append("comments", String(formData.notifications.comments));
    form.append("candidates", String(formData.notifications.candidates));
    form.append("offers", String(formData.notifications.offers));
    form.append("push", formData.notifications.push);

    if (formData.photo) form.append("photo", formData.photo);
    if (formData.coverPhoto) form.append("coverPhoto", formData.coverPhoto);

    try {
      // Check if user has profile
      const resCheck = await fetch(
        `${API_BASE_URL}/profiles/?email=${user.email}`
      );
      const existingProfile = await resCheck.json();

      const url =
        existingProfile && existingProfile.length > 0
          ? `${API_BASE_URL}/profiles/${existingProfile[0].id}/` // update
          : `${API_BASE_URL}/profiles/`; // create

      const method = existingProfile && existingProfile.length > 0 ? "PUT" : "POST";

      const res = await fetch(url, { method, body: form });

      if (!res.ok) {
        const error = await res.json();
        throw error;
      }

      const data = await res.json();
      alert(
        existingProfile && existingProfile.length > 0
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );
      console.log("Profile saved:", data);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile");
    }
  };

  if (loading) return <p className="text-white p-6">Loading profile...</p>;


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-12">
        {/* Profile Section */}
        <SectionGrid
          title="Profile"
          description="This information will be displayed publicly. Be careful what you share."
        >
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />
          <Textarea
            label="About"
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            helperText="Write a few sentences about yourself."
          />
          <FileInput
            label="Photo"
            name="photo"
            icon={
              photoPreview ? (
                <img
                  src={photoPreview}
                  className="h-12 w-12 rounded-full object-cover"
                  alt="Profile Preview"
                />
              ) : (
                <UserCircleIcon className="h-12 w-12 text-gray-400" />
              )
            }
            onChange={handleFileChange}
          />

          <FileInput
            label="Cover photo"
            name="coverPhoto"
            icon={
              coverPreview ? (
                <img
                  src={coverPreview}
                  className="h-12 w-12 rounded-md object-cover"
                  alt="Cover Preview"
                />
              ) : (
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              )
            }
            onChange={handleFileChange}
            dragDrop
          />
        </SectionGrid>

        {/* Personal Information Section */}
        <SectionGrid
          title="Personal Information"
          description="Use a permanent address where you can receive mail."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="First name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <Input
              label="Last name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
          <Input
            label="Email address"
            name="email"
            type="email"
            value={user?.email || ""}
            onChange={handleInputChange}
          />

          <Select
            label="Country"
            name="country"
            value={formData.country}
            options={["United States", "Canada", "Mexico"]}
            onChange={handleInputChange}
          />
          <Input
            label="Street address"
            name="streetAddress"
            value={formData.streetAddress}
            onChange={handleInputChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
            <Input
              label="State / Province"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
            />
            <Input
              label="ZIP / Postal code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
            />
          </div>
        </SectionGrid>

        {/* Notifications Section */}
        <SectionGrid
          title="Notifications"
          description="We'll always let you know about important changes, but you pick what else you want to hear about."
        >
          <div className="space-y-4">
            <Checkbox
              label="Comments"
              name="comments"
              checked={formData.notifications.comments}
              onChange={handleInputChange}
              helperText="Get notified when someone posts a comment."
            />
            <Checkbox
              label="Candidates"
              name="candidates"
              checked={formData.notifications.candidates}
              onChange={handleInputChange}
              helperText="Get notified when a candidate applies for a job."
            />
            <Checkbox
              label="Offers"
              name="offers"
              checked={formData.notifications.offers}
              onChange={handleInputChange}
              helperText="Get notified when a candidate accepts or rejects an offer."
            />
            <RadioGroup
              label="Push notifications"
              name="push"
              options={[
                { label: "Everything", value: "everything" },
                { label: "Same as email", value: "email" },
                { label: "No push notifications", value: "none" },
              ]}
              selected={formData.notifications.push}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: value },
                }))
              }
            />
          </div>
        </SectionGrid>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="text-gray-300 font-semibold hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-md shadow"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

/* --- Section Grid Layout (left title/description, right inputs) --- */
const SectionGrid: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-700 pb-8">
    <div className="text-sm font-medium text-gray-400 space-y-1">
      <h2 className="text-white">{title}</h2>
      <p>{description}</p>
    </div>
    <div className="md:col-span-2 space-y-6">{children}</div>
  </div>
);

/* --- Input Components --- */
const Input: React.FC<{
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
}> = ({ label, name, type = "text", value, onChange, prefix }) => (
  <div>
    <label className="block text-sm font-medium text-gray-100">{label}</label>
    <div className="mt-2 flex items-center rounded-md bg-gray-800 border border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500">
      {prefix && (
        <span className="px-3 text-gray-400 select-none">{prefix}</span>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none"
      />
    </div>
  </div>
);

const Textarea: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  helperText?: string;
}> = ({ label, name, value, onChange, helperText }) => (
  <div>
    <label className="block text-sm font-medium text-gray-100">{label}</label>
    <textarea
      id={name}
      name={name}
      rows={3}
      value={value}
      onChange={onChange}
      className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    {helperText && <p className="mt-1 text-sm text-gray-400">{helperText}</p>}
  </div>
);

const FileInput: React.FC<{
  label: string;
  name: string;
  icon: React.ReactNode;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  dragDrop?: boolean;
}> = ({ label, name, icon, onChange, dragDrop }) => (
  <div>
    <label className="block text-sm font-medium text-gray-100">{label}</label>
    <div
      className={`mt-2 flex items-center gap-3 ${
        dragDrop
          ? "justify-center border-2 border-dashed py-6 rounded-md border-gray-700"
          : ""
      }`}
    >
      {icon}
      <label className="cursor-pointer text-indigo-500 font-semibold">
        <span>Upload a file</span>
        <input
          type="file"
          name={name}
          onChange={onChange}
          className="sr-only"
        />
      </label>

      {dragDrop && <p className="text-gray-400 pl-2">or drag and drop</p>}
    </div>
  </div>
);

const Select: React.FC<{
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, name, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-100">{label}</label>
    <div className="mt-2 relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
  </div>
);

const Checkbox: React.FC<{
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
}> = ({ label, name, checked, onChange, helperText }) => (
  <div className="flex items-start gap-3">
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={checked}
      onChange={onChange}
      className="mt-1 h-4 w-4 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
    />
    <div>
      <label className="text-sm font-medium text-gray-100" htmlFor={name}>
        {label}
      </label>
      {helperText && <p className="text-sm text-gray-400">{helperText}</p>}
    </div>
  </div>
);

const RadioGroup: React.FC<{
  label: string;
  name: string;
  options: { label: string; value: "everything" | "email" | "none" }[];
  selected: "everything" | "email" | "none";
  onChange: (value: "everything" | "email" | "none") => void;
}> = ({ label, name, options, selected, onChange }) => (
  <fieldset className="space-y-3">
    <legend className="text-sm font-semibold text-gray-100">{label}</legend>
    {options.map((opt) => (
      <div key={opt.value} className="flex items-center gap-3">
        <input
          type="radio"
          id={opt.value}
          name={name}
          checked={selected === opt.value}
          onChange={() => onChange(opt.value)}
          className="h-4 w-4 text-indigo-500 border-gray-600 focus:ring-indigo-500"
        />
        <label
          htmlFor={opt.value}
          className="text-sm font-medium text-gray-100"
        >
          {opt.label}
        </label>
      </div>
    ))}
  </fieldset>
);
