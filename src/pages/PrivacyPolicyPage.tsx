import React from "react";
import PageLayout from "../components/PageLayout";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageLayout title="プライバシーポリシー">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          1. 個人情報の取り扱いについて
        </h2>
        <p className="mb-4">
          当社は、お客様の個人情報を適切に取り扱い、保護することが社会的責務であると考え、
          個人情報の保護に関する法律、その他の関係法令を遵守し、お客様の大切な個人情報の保護に努めます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          2. 個人情報の収集について
        </h2>
        <p className="mb-4">
          当社は、サービスの提供、お問い合わせ対応、その他当社の事業に関する目的のために必要な範囲で、
          お客様の個人情報を収集させていただく場合があります。
        </p>
        <p className="mb-4">
          収集する個人情報は、氏名、電子メールアドレス、電話番号などのお客様の識別や連絡に必要な情報に限定し、
          適法かつ公正な手段によって収集いたします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. 個人情報の利用目的</h2>
        <p className="mb-4">
          当社は、収集した個人情報を以下の目的で利用いたします：
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>当社サービスの提供・運営</li>
          <li>お問い合わせに対する回答</li>
          <li>サービスの改善や新サービスの開発</li>
          <li>お客様への重要なお知らせ</li>
          <li>法令に基づく場合や公共の利益のために必要な場合</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          4. 個人情報の第三者提供について
        </h2>
        <p className="mb-4">
          当社は、以下の場合を除き、お客様の個人情報を第三者に提供することはありません：
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>お客様の同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合</li>
          <li>
            公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合
          </li>
          <li>
            国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          5. 個人情報の安全管理措置
        </h2>
        <p className="mb-4">
          当社は、個人情報の漏洩、滅失または毀損を防止するため、適切なセキュリティ対策を実施し、
          個人情報の安全管理に努めます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          6. プライバシーポリシーの変更
        </h2>
        <p className="mb-4">
          当社は、必要に応じて本プライバシーポリシーを変更することがあります。
          変更した場合は、当ウェブサイトに掲載することにより公表します。
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">7. お問い合わせ</h2>
        <p>
          個人情報の取り扱いに関するお問い合わせは、当社ウェブサイトのお問い合わせフォームよりご連絡ください。
        </p>
      </section>
    </PageLayout>
  );
};

export default PrivacyPolicyPage;
