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
  const [loading, setLoading] = useState(true);

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

    if (!currentUser) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/profiles/?email=${currentUser.email}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profile not found");
        return res.json();
      })
      .then((profile) => {
        if (!profile) return;

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
            comments: profile.notifications?.comments ?? true,
            candidates: profile.notifications?.candidates ?? false,
            offers: profile.notifications?.offers ?? false,
            push: profile.notifications?.push || "everything",
          },
        });

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
      const resCheck = await fetch(`${API_BASE_URL}/profiles/?email=${user.email}`);
      const existingProfile = await resCheck.json();

      const url =
        existingProfile && existingProfile.length > 0
          ? `${API_BASE_URL}/profiles/${existingProfile[0].id}/`
          : `${API_BASE_URL}/profiles/`;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-medium text-gray-600">
        Loading workspace profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <form onSubmit={handleSubmit} className="w-full">

        {/* Top Sticky Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-4 md:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                  Account Settings
                </h1>
                {user && (
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded border border-gray-200">
                    UID: {user.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                Manage your formal instructor identity and communication rules
              </p>
            </div>

            {/* Global Actions Block */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="flex-1 sm:flex-initial rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition shadow-sm text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial rounded-md bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 active:bg-gray-950 transition shadow-sm text-center"
              >
                Save Changes
              </button>
            </div>
          </div>
        </header>

        {/* Form Body - Full Width Spanning Constraint */}
        <main className="max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-12 space-y-12 divide-y divide-gray-200">

          {/* Section 1: Public Profile Identity */}
          <SectionGrid
            title="Identity Details"
            description="This parameters build up your dynamic public catalog profile presentation footprint."
          >
            <Input
              label="Username Address"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              prefix="EduMate/"
            />

            <Textarea
              label="Biography Overview"
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              helperText="Brief summary highlighting your experience parameters or instructional values."
            />

            {/* Avatars Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Profile Avatar Picture
                </label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      className="h-14 w-14 rounded-full object-cover border border-gray-200 shadow-sm"
                      alt="Profile Preview"
                    />
                  ) : (
                    <UserCircleIcon className="h-14 w-14 text-gray-300" />
                  )}
                  <FileInput name="photo" onChange={handleFileChange} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Cover Showcase Layout
                </label>
                <div className="flex items-center gap-4">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      className="h-14 w-24 rounded object-cover border border-gray-200 shadow-sm"
                      alt="Cover Preview"
                    />
                  ) : (
                    <PhotoIcon className="h-14 w-14 text-gray-300" />
                  )}
                  <FileInput name="coverPhoto" onChange={handleFileChange} dragDrop />
                </div>
              </div>
            </div>
          </SectionGrid>

          {/* Section 2: Personal Registry Information */}
          <SectionGrid
            title="Personal Location Registry"
            description="Private physical correspondence addresses verification layer profiles."
            className="pt-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Registered Email Connection
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-500 outline-none cursor-not-allowed"
              />
            </div>

            <Select
              label="Country Region"
              name="country"
              value={formData.country}
              options={["United States", "Canada", "Mexico", "United Kingdom", "Sri Lanka"]}
              onChange={handleInputChange}
            />

            <Input
              label="Street Real Estate Address"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Input
                label="City / Township"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
              <Input
                label="State / District Province"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
              />
              <Input
                label="Postal Routing ZIP"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
              />
            </div>
          </SectionGrid>

          {/* Section 3: Notification Metrics */}
          <SectionGrid
            title="Communication Metrics"
            description="Configure real-time automation alerts regarding student operations."
            className="pt-12 pb-6"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                  Email Alert Routing Rules
                </h3>
                <div className="space-y-4">
                  <Checkbox
                    label="Discussion Board Comments"
                    name="comments"
                    checked={formData.notifications.comments}
                    onChange={handleInputChange}
                    helperText="Alert immediately when comments register on published course blocks."
                  />
                  <Checkbox
                    label="Candidate Admission Enrolment"
                    name="candidates"
                    checked={formData.notifications.candidates}
                    onChange={handleInputChange}
                    helperText="Notify instantly when new students apply or request module tokens."
                  />
                  <Checkbox
                    label="Promotional Corporate Offers"
                    name="offers"
                    checked={formData.notifications.offers}
                    onChange={handleInputChange}
                    helperText="Get notified upon custom institutional purchase tier evaluations."
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <RadioGroup
                  label="Device Telemetry Push Deliveries"
                  name="push"
                  options={[
                    { label: "Deliver everything instantly", value: "everything" },
                    { label: "Sync identical with email protocols", value: "email" },
                    { label: "Deactivate push pipelines entirely", value: "none" },
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
            </div>
          </SectionGrid>

        </main>
      </form>
    </div>
  );
}

/* --- Helper Structural Sub-Components Layout System --- */

const SectionGrid: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className = "" }) => (
  <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${className}`}>
    <div className="lg:col-span-1 space-y-1.5">
      <h2 className="text-base font-bold text-gray-900 tracking-tight">{title}</h2>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
    <div className="lg:col-span-2 space-y-6">{children}</div>
  </div>
);

const Input: React.FC<{
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
}> = ({ label, name, type = "text", value, onChange, prefix }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
    <div className="flex items-center rounded-md bg-white border border-gray-300 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition overflow-hidden">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-gray-400 select-none font-medium">{prefix}</span>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 text-sm bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
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
  <div className="space-y-2">
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
    <textarea
      id={name}
      name={name}
      rows={4}
      value={value}
      onChange={onChange}
      className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition resize-y"
    />
    {helperText && <p className="text-xs text-gray-400 mt-1">{helperText}</p>}
  </div>
);

const FileInput: React.FC<{
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  dragDrop?: boolean;
}> = ({ name, onChange, dragDrop }) => (
  <label className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition cursor-pointer">
    <span>{dragDrop ? "Choose Cover" : "Update Asset"}</span>
    <input type="file" name={name} accept="image/*" onChange={onChange} className="sr-only" />
  </label>
);

const Select: React.FC<{
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, name, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full rounded-md border border-gray-300 bg-white pl-3 pr-10 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 appearance-none transition"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
  <label className="flex items-start gap-3 cursor-pointer select-none group">
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={checked}
      onChange={onChange}
      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 accent-gray-900"
    />
    <div>
      <span className="text-sm font-medium text-gray-900 group-hover:text-black transition">
        {label}
      </span>
      {helperText && <p className="text-xs text-gray-400 mt-0.5">{helperText}</p>}
    </div>
  </label>
);

const RadioGroup: React.FC<{
  label: string;
  name: string;
  options: { label: string; value: "everything" | "email" | "none" }[];
  selected: "everything" | "email" | "none";
  onChange: (value: "everything" | "email" | "none") => void;
}> = ({ label, name, options, selected, onChange }) => (
  <fieldset className="space-y-3">
    <legend className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</legend>
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-3 cursor-pointer select-none group">
          <input
            type="radio"
            id={opt.value}
            name={name}
            checked={selected === opt.value}
            onChange={() => onChange(opt.value)}
            className="h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900 accent-gray-900"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
);