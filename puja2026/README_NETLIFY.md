# শারদীয়া দুর্গাপূজা — Netlify Deployment Guide

এই জিপ (ZIP) ফাইলটিতে সম্পূর্ণ ওয়েবসাইট এবং সোর্স কোড রয়েছে।

## অপশন ১: সবচেয়ে সহজ পদ্ধতি (Netlify Drag & Drop — মাত্র ১০ সেকেন্ডে লাইভ)
১. জিপ ফাইলটি আনজিপ করুন।
২. "netlify_deploy_ready_dist" ফোল্ডারটি দেখুন (এটিতে index.html, assets এবং _redirects ফাইল আছে)।
৩. ব্রাউজারে যান: https://app.netlify.com/drop
৪. আপনার Netlify অ্যাকাউন্টে লগইন করে "netlify_deploy_ready_dist" ফোল্ডারটি সরাসরি টেনে ছেড়ে দিন (Drag & Drop)।
৫. নিমেষেই ওয়েবসাইটটি লাইভ হয়ে যাবে এবং আপনি বিনামূল্যে .netlify.app ডোমেইন পাবেন!

---

## অপশন ২: গিটহাব ও Netlify কানেকশন (GitHub + Netlify CI/CD)
১. "source_code" ফোল্ডারের ফাইলগুলো আপনার GitHub রিপোজিটরিতে আপলোড করুন।
২. Netlify Dashboard > "Add new site" > "Import an existing project" > GitHub নির্বাচন করুন।
৩. Build Settings:
   - Build Command: npm run build
   - Publish directory: dist
৪. Deploy Site ক্লিক করুন।

ওয়েবসাইটটি সম্পূর্ণ রেসপন্সিভ, মোবাইল ফ্রেন্ডলি এবং অ্যাডমিন প্যানেল সহ ১০০% প্রস্তুত।
