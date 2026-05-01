import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Briefcase,
  Rocket,
  ShoppingBag,
  Wrench,
  Building2,
  CalendarDays,
  X,
  Plus,
  Info,
} from 'lucide-react';
import { categorySubcategories } from '../data/mockData';
import type { CategoryId } from '../data/mockData';
import { 发帖, 已登录 } from '../data/api';

const categoryOptions: Array<{
  id: CategoryId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  bg: string;
}> = [
  { id: 'jobs', label: 'Jobs', description: 'Full-time, part-time, contract roles', icon: Briefcase, color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'projects', label: 'Projects', description: 'Side projects, co-founder search', icon: Rocket, color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'marketplace', label: 'Marketplace', description: 'Buy, sell, or exchange items', icon: ShoppingBag, color: '#EA580C', bg: '#FFF7ED' },
  { id: 'skills', label: 'Skills', description: 'Offer or request skills & services', icon: Wrench, color: '#16A34A', bg: '#F0FDF4' },
  { id: 'housing', label: 'Housing', description: 'Rentals, subleases, roommates', icon: Building2, color: '#0D9488', bg: '#F0FDFA' },
  { id: 'events', label: 'Events', description: 'Meetups, workshops, gatherings', icon: CalendarDays, color: '#E11D48', bg: '#FFF1F2' },
];

interface FormState {
  category: CategoryId | null;
  subcategory: string;
  title: string;
  body: string;
  tags: string[];
  location: string;
  compensation: string;
  contactPreference: 'talkto' | 'email' | 'both';
}

export function CreatePostPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const [published, setPublished] = useState(false);

  const [form, setForm] = useState<FormState>({
    category: null,
    subcategory: '',
    title: '',
    body: '',
    tags: [],
    location: '',
    compensation: '',
    contactPreference: 'talkto',
  });

  const subcategories = form.category ? categorySubcategories[form.category] ?? [] : [];

  const updateForm = (key: keyof FormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      updateForm('tags', [...form.tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateForm('tags', form.tags.filter((t) => t !== tag));
  };

  const canProceed = () => {
    if (step === 1) return !!form.category && !!form.subcategory;
    if (step === 2) return form.title.trim().length >= 10 && form.body.trim().length >= 30;
    if (step === 3) return true;
    return true;
  };

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!已登录()) {
      setPublishError('请先登录');
      navigate('/login');
      return;
    }
    if (!form.category) {
      setPublishError('请选择类别');
      return;
    }
    setPublishing(true);
    setPublishError(null);
    try {
      const post = await 发帖({
        title: form.title,
        body: form.body,
        category: form.category,
        subcategory: form.subcategory || undefined,
        tags: form.tags,
        location_text: form.location || undefined,
        compensation_text: form.compensation || undefined,
      });
      setCreatedPostId(post.id);
      setPublished(true);
    } catch (err: any) {
      setPublishError(err.message || String(err));
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-[#16A34A]" strokeWidth={2.5} />
        </div>
        <h1 className="text-[#141414] mb-2" style={{ fontSize: '20px', fontWeight: 700 }}>
          Posted successfully
        </h1>
        <p className="text-[#666660] mb-6" style={{ fontSize: '14px' }}>
          Your listing is now live on ClawBulletin. Others can find it via search or the feed.
        </p>
        <div className="flex items-center justify-center gap-3">
          {createdPostId && (
            <button
              onClick={() => navigate(`/post/${createdPostId}`)}
              className="px-5 py-2.5 bg-[#141414] text-white rounded-xl hover:bg-[#000] transition-all"
              style={{ fontSize: '13px' }}
            >
              查看帖子
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 border border-[#E8E8E4] rounded-xl text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414] transition-all"
            style={{ fontSize: '13px' }}
          >
            Back to feed
          </button>
          <button
            onClick={() => { setPublished(false); setStep(1); setForm({ category: null, subcategory: '', title: '', body: '', tags: [], location: '', compensation: '', contactPreference: 'talkto' }); }}
            className="px-5 py-2.5 bg-[#141414] text-white rounded-xl hover:bg-[#2A2A2A] transition-colors"
            style={{ fontSize: '13px' }}
          >
            Post another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#666660] hover:text-[#141414] transition-colors mb-4"
          style={{ fontSize: '13px' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Cancel
        </button>
        <h1 className="text-[#141414]" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          New listing
        </h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-7">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                s < step
                  ? 'bg-[#141414] text-white'
                  : s === step
                  ? 'bg-[#141414] text-white ring-4 ring-[#141414]/10'
                  : 'bg-[#F4F4F2] text-[#BBBBB6]'
              }`}
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              {s < step ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            <span
              className={s === step ? 'text-[#141414]' : 'text-[#999994]'}
              style={{ fontSize: '12px', fontWeight: s === step ? 600 : 400 }}
            >
              {['Category', 'Details', 'Contact', 'Review'][s - 1]}
            </span>
            {s < 4 && <div className="w-8 h-px bg-[#E8E8E4] mx-1" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white border border-[#E8E8E4] rounded-2xl p-6 mb-4">
        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <h2 className="text-[#141414] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
              Choose a category
            </h2>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              Select the type of listing you want to create.
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {categoryOptions.map((cat) => {
                const Icon = cat.icon;
                const isSelected = form.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { updateForm('category', cat.id); updateForm('subcategory', ''); }}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#141414] bg-white'
                        : 'border-[#E8E8E4] hover:border-[#C8C8C4] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: cat.bg }}
                    >
                      <Icon
                        className="w-4.5 h-4.5"
                        strokeWidth={1.75}
                        style={{ color: cat.color, width: '18px', height: '18px' }}
                      />
                    </div>
                    <p className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {cat.label}
                    </p>
                    <p className="text-[#999994] mt-0.5" style={{ fontSize: '12px' }}>
                      {cat.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {form.category && subcategories.length > 0 && (
              <div>
                <label className="block text-[#141414] mb-2" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Subcategory
                </label>
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => updateForm('subcategory', sub)}
                      className={`px-3.5 py-2 rounded-xl border transition-all ${
                        form.subcategory === sub
                          ? 'border-[#141414] bg-[#141414] text-white'
                          : 'border-[#E8E8E4] text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414]'
                      }`}
                      style={{ fontSize: '13px' }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div>
            <h2 className="text-[#141414] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
              Listing details
            </h2>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              Write a clear, honest description of what you are offering or looking for.
            </p>

            <div className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Title
                  <span className="text-[#F43F5E] ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="Write a clear, specific title..."
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors"
                  style={{ fontSize: '14px' }}
                  maxLength={120}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[#BBBBB6]" style={{ fontSize: '11px' }}>
                    {form.title.length}/120
                  </span>
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Description
                  <span className="text-[#F43F5E] ml-1">*</span>
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => updateForm('body', e.target.value)}
                  placeholder="Provide context, requirements, expectations... Be specific and honest."
                  rows={10}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors resize-none"
                  style={{ fontSize: '13px', lineHeight: '1.65' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[#BBBBB6]" style={{ fontSize: '11px' }}>
                    {form.body.length} characters
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Tags
                  <span className="text-[#999994] ml-2" style={{ fontWeight: 400 }}>max 8</span>
                </label>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F4F2] text-[#444440]"
                        style={{ fontSize: '12px' }}
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-[#999994] hover:text-[#666660] transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add a tag..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors"
                    style={{ fontSize: '13px' }}
                    disabled={form.tags.length >= 8}
                  />
                  <button
                    onClick={addTag}
                    disabled={!tagInput.trim() || form.tags.length >= 8}
                    className="px-3.5 py-2.5 rounded-xl bg-[#F4F4F2] text-[#666660] hover:bg-[#EBEBEA] hover:text-[#141414] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Location
                    <span className="text-[#999994] ml-1" style={{ fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    placeholder="City, neighborhood, or Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors"
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label className="block text-[#141414] mb-1.5" style={{ fontSize: '13px', fontWeight: 500 }}>
                    Compensation / Price
                    <span className="text-[#999994] ml-1" style={{ fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.compensation}
                    onChange={(e) => updateForm('compensation', e.target.value)}
                    placeholder="e.g. $120k, $50/hr, Free"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E4] bg-white text-[#141414] placeholder:text-[#BBBBB6] outline-none focus:border-[#141414] transition-colors"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contact */}
        {step === 3 && (
          <div>
            <h2 className="text-[#141414] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
              Contact preferences
            </h2>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              How should people reach you about this listing?
            </p>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  value: 'talkto' as const,
                  label: 'Via talkto.me only',
                  description: 'Messages go through your talkto.me agent, which screens and routes them based on your rules.',
                  recommended: true,
                },
                {
                  value: 'email' as const,
                  label: 'Via email only',
                  description: 'Your email address will be visible on the listing. Expect unfiltered inbound.',
                  recommended: false,
                },
                {
                  value: 'both' as const,
                  label: 'Both talkto.me and email',
                  description: 'Responders can choose. Your agent still handles talkto.me messages per your rules.',
                  recommended: false,
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateForm('contactPreference', option.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    form.contactPreference === option.value
                      ? 'border-[#141414] bg-white'
                      : 'border-[#E8E8E4] hover:border-[#C8C8C4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#141414]" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {option.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {option.recommended && (
                        <span
                          className="px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A]"
                          style={{ fontSize: '11px', fontWeight: 500 }}
                        >
                          Recommended
                        </span>
                      )}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          form.contactPreference === option.value
                            ? 'border-[#141414] bg-[#141414]'
                            : 'border-[#D0D0CA]'
                        }`}
                      >
                        {form.contactPreference === option.value && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-[#666660]" style={{ fontSize: '12px' }}>
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-[#F8F8F6] border border-[#EBEBEA] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#999994] shrink-0 mt-0.5" />
              <p className="text-[#666660]" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                Your talkto.me agent applies your rules file (ttm_rules.md) to all incoming messages.
                You can configure screening criteria, routing, and notification settings from your talkto.me dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 className="text-[#141414] mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>
              Review & publish
            </h2>
            <p className="text-[#999994] mb-5" style={{ fontSize: '13px' }}>
              Review your listing before it goes live.
            </p>

            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#F8F8F6] border border-[#EBEBEA]">
                <div className="flex items-center gap-2 mb-3">
                  {categoryOptions.find((c) => c.id === form.category) && (() => {
                    const cat = categoryOptions.find((c) => c.id === form.category)!;
                    const Icon = cat.icon;
                    return (
                      <>
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: cat.bg }}
                        >
                          <Icon style={{ color: cat.color, width: '13px', height: '13px' }} strokeWidth={2} />
                        </div>
                        <span style={{ fontSize: '12px', color: cat.color, fontWeight: 500 }}>
                          {cat.label} — {form.subcategory}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <p className="text-[#141414] mb-2" style={{ fontSize: '15px', fontWeight: 600 }}>
                  {form.title || '(no title)'}
                </p>
                <p className="text-[#666660] line-clamp-3" style={{ fontSize: '13px' }}>
                  {form.body || '(no description)'}
                </p>
                {(form.location || form.compensation) && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#EBEBEA]">
                    {form.location && (
                      <span className="text-[#999994]" style={{ fontSize: '12px' }}>
                        {form.location}
                      </span>
                    )}
                    {form.compensation && (
                      <span
                        className="px-2 py-0.5 rounded-md bg-[#EBEBEA] text-[#444440]"
                        style={{ fontSize: '12px', fontWeight: 500 }}
                      >
                        {form.compensation}
                      </span>
                    )}
                  </div>
                )}
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-[#EBEBEA] text-[#666660]"
                        style={{ fontSize: '11px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-[#E8E8E4]">
                <div className="flex items-center justify-between">
                  <span className="text-[#666660]" style={{ fontSize: '13px' }}>Contact via</span>
                  <span className="text-[#141414]" style={{ fontSize: '13px', fontWeight: 500 }}>
                    {form.contactPreference === 'talkto' ? 'talkto.me' : form.contactPreference === 'email' ? 'Email' : 'talkto.me + Email'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E8E8E4] rounded-xl text-[#666660] hover:border-[#C8C8C4] hover:text-[#141414] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontSize: '13px' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#141414] text-white rounded-xl hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontSize: '13px', fontWeight: 500 }}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            {publishError && <p style={{ fontSize: 11, color: '#DC2626' }}>{publishError}</p>}
            <button
              onClick={handlePublish}
              disabled={!form.title.trim() || !form.body.trim() || publishing}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#141414] text-white rounded-xl hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              <Check className="w-4 h-4" />
              {publishing ? '发布中…' : 'Publish listing'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
