import React from "react";
import PageLayout from "../components/PageLayout";

const CompanyPage: React.FC = () => {
  return (
    <PageLayout title="運営者情報">
      <div className="space-y-8">
        <table className="min-w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold w-1/3 bg-gray-50">
                会社名
              </th>
              <td className="py-4 px-6">株式会社ListenMate</td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                設立
              </th>
              <td className="py-4 px-6">2020年4月1日</td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                代表取締役
              </th>
              <td className="py-4 px-6">山田 太郎</td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                所在地
              </th>
              <td className="py-4 px-6">
                〒100-0001
                <br />
                東京都千代田区千代田1-1-1
              </td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                電話番号
              </th>
              <td className="py-4 px-6">03-1234-5678</td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                メールアドレス
              </th>
              <td className="py-4 px-6">info@listenmate.example.com</td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                事業内容
              </th>
              <td className="py-4 px-6">
                <ul className="list-disc pl-5">
                  <li>語学学習アプリケーションの開発・運営</li>
                  <li>教育コンテンツの企画・制作</li>
                  <li>オンライン学習サポートサービス</li>
                </ul>
              </td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                資本金
              </th>
              <td className="py-4 px-6">1,000万円</td>
            </tr>
          </tbody>
        </table>

        <section>
          <h2 className="text-xl font-semibold mb-4">企業理念</h2>
          <p className="mb-4">
            ListenMateは「誰もが、いつでも、どこでも、自分のペースで語学を習得できる世界を創る」という理念のもと、
            最新のテクノロジーを活用した革新的な語学学習サービスを提供しています。
          </p>
          <p>
            私たちは、AIと教育のプロフェッショナルが協力し、一人ひとりに合わせたパーソナライズされた学習体験を通じて、
            世界中の人々の可能性を広げるお手伝いをします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">アクセス</h2>
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Googleマップが表示されます</span>
            </div>
          </div>
          <p>
            <strong>最寄り駅：</strong>
            東京メトロ丸ノ内線・千代田線「霞ヶ関駅」A1出口より徒歩3分
          </p>
        </section>
      </div>
    </PageLayout>
  );
};

export default CompanyPage;
