'use client';

import { useState } from 'react';
import { Upload, Link as LinkIcon, Camera, DollarSign, Tag, MapPin, FileText, Loader2, Check } from 'lucide-react';

const categories = [
  { id: '1', name: 'Tech Merch', slug: 'tech-merch' },
  { id: '2', name: 'Digital Services', slug: 'digital-services' },
  { id: '3', name: 'Computers & Hardware', slug: 'computers' },
  { id: '4', name: 'API Credits', slug: 'api-credits' },
  { id: '5', name: 'Hackathon Food', slug: 'hackathon-food' },
];

const conditions = [
  { value: 'NEW', label: 'New', description: 'Brand new, never used' },
  { value: 'LIKE_NEW', label: 'Like New', description: 'Excellent condition, barely used' },
  { value: 'GOOD', label: 'Good', description: 'Normal wear, fully functional' },
  { value: 'FAIR', label: 'Fair', description: 'Some wear, works well' },
  { value: 'DIGITAL', label: 'Digital', description: 'Digital item or service' },
];

export default function SellPage() {
  const [listingMethod, setListingMethod] = useState<'manual' | 'url'>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlIngestion, setUrlIngestion] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    cryptoPrice: '',
    cryptoCurrency: 'ETH',
    categoryId: '',
    condition: 'NEW',
    quantity: '1',
    isDigital: false,
  });
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    alert('Shell yeah! 🦞 Your listing has been submitted for review.');
  };

  const handleUrlIngestion = async () => {
    if (!urlIngestion) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    alert('URL submitted for ingestion! Our clawdbots will process it shortly. 🦞');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // For demo, just show placeholder URLs
    const newImages = Array.from(files).map((_, i) => 
      `https://picsum.photos/seed/${Date.now() + i}/800/600`
    );
    setImages([...images, ...newImages].slice(0, 10));
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-lobster-500 to-lobster-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
            <span className="text-4xl animate-wave">🦞</span>
            Sell on Clawdslist
          </h1>
          <p className="text-lobster-100">
            List your tech gear, digital goods, or services. Our clawdbots will help you reach buyers.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Method Toggle */}
        <div className="bg-white rounded-xl border border-neutral-200 p-2 mb-6 flex gap-2">
          <button
            onClick={() => setListingMethod('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              listingMethod === 'manual'
                ? 'bg-lobster-500 text-white'
                : 'hover:bg-neutral-50'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">Manual Entry</span>
          </button>
          <button
            onClick={() => setListingMethod('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
              listingMethod === 'url'
                ? 'bg-lobster-500 text-white'
                : 'hover:bg-neutral-50'
            }`}
          >
            <LinkIcon className="h-5 w-5" />
            <span className="font-medium">Import from URL</span>
          </button>
        </div>

        {listingMethod === 'url' ? (
          /* URL Ingestion */
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Import from URL</h2>
            <p className="text-neutral-600 mb-6">
              Paste a product URL and our clawdbots will automatically extract the listing details.
              Works with most e-commerce sites.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Product URL
                </label>
                <input
                  type="url"
                  value={urlIngestion}
                  onChange={(e) => setUrlIngestion(e.target.value)}
                  placeholder="https://example.com/product/..."
                  className="input"
                />
              </div>
              
              <button
                onClick={handleUrlIngestion}
                disabled={!urlIngestion || isSubmitting}
                className="btn-primary w-full py-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Import Listing
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-ocean-50 rounded-lg border border-ocean-200">
              <h3 className="font-medium text-ocean-800 mb-2">🦞 How it works</h3>
              <ol className="text-sm text-ocean-700 space-y-1">
                <li>1. Paste the URL of a product you want to list</li>
                <li>2. Our Firecrawl-powered clawdbots extract the details</li>
                <li>3. Review and edit the imported listing</li>
                <li>4. Publish and start selling!</li>
              </ol>
            </div>
          </div>
        ) : (
          /* Manual Entry Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5 text-neutral-500" />
                Photos
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                    <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {images.length < 10 && (
                  <label className="aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-lobster-400 hover:bg-lobster-50 transition-colors">
                    <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                    <span className="text-sm text-neutral-500">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-sm text-neutral-500">
                Add up to 10 photos. First photo will be the cover image.
              </p>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-neutral-500" />
                Listing Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="What are you selling?"
                    className="input"
                    required
                    maxLength={200}
                  />
                  <p className="text-xs text-neutral-500 mt-1">{formData.title.length}/200</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your item in detail. Include condition, features, and any relevant information."
                    className="input min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Condition *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="input"
                      required
                    >
                      {conditions.map((cond) => (
                        <option key={cond.value} value={cond.value}>
                          {cond.label} - {cond.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDigital"
                    checked={formData.isDigital}
                    onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                    className="rounded text-lobster-500 focus:ring-lobster-500"
                  />
                  <label htmlFor="isDigital" className="text-sm text-neutral-700">
                    This is a digital item (instant delivery)
                  </label>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-neutral-500" />
                Pricing
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Price (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className="input pl-8"
                        required
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="input"
                      min="1"
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <p className="text-sm text-neutral-600 mb-3">
                    Accept crypto payments? (Optional)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Crypto Price
                      </label>
                      <input
                        type="number"
                        value={formData.cryptoPrice}
                        onChange={(e) => setFormData({ ...formData, cryptoPrice: e.target.value })}
                        placeholder="0.00"
                        className="input"
                        step="0.000001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={formData.cryptoCurrency}
                        onChange={(e) => setFormData({ ...formData, cryptoCurrency: e.target.value })}
                        className="input"
                      >
                        <option value="ETH">ETH (Ethereum)</option>
                        <option value="SOL">SOL (Solana)</option>
                        <option value="USDC">USDC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={() => alert('Draft saved!')}
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 py-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Publish Listing
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
