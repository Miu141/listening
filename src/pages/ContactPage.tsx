import React, { useState } from "react";
import PageLayout from "../components/PageLayout";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 入力があればエラーをクリア
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "お名前を入力してください";
    }

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!formData.subject) {
      newErrors.subject = "お問い合わせ項目を選択してください";
    }

    if (!formData.message.trim()) {
      newErrors.message = "お問い合わせ内容を入力してください";
    } else if (formData.message.length < 10) {
      newErrors.message = "お問い合わせ内容は10文字以上で入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // お問い合わせ送信処理をシミュレート
    setTimeout(() => {
      console.log("送信データ:", formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      // フォームをリセット
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  return (
    <PageLayout title="お問い合わせ">
      {isSubmitted ? (
        <div className="text-center py-8 space-y-4">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-primary">
            お問い合わせを受け付けました
          </h2>
          <p className="mb-4">
            お問い合わせいただき、ありがとうございます。
            <br />
            内容を確認次第、担当者よりご連絡いたします。
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-4 px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            新しいお問い合わせをする
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <p className="mb-8">
            以下のフォームに必要事項をご記入の上、送信ボタンをクリックしてください。
            お問い合わせ内容を確認次第、担当者よりご連絡いたします。
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                お問い合わせ項目 <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${
                  errors.subject ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">選択してください</option>
                <option value="service">サービスについて</option>
                <option value="account">アカウントについて</option>
                <option value="payment">お支払いについて</option>
                <option value="technical">技術的な問題</option>
                <option value="other">その他</option>
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            <div className="flex items-center justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    送信中...
                  </>
                ) : (
                  "送信する"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </PageLayout>
  );
};

export default ContactPage;
