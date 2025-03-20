import React from "react";
import PageLayout from "../components/PageLayout";

const LegalPage: React.FC = () => {
  return (
    <PageLayout title="特定商取引法に基づく表記">
      <div className="space-y-8">
        <table className="min-w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold w-1/3 bg-gray-50">
                事業者名
              </th>
              <td className="py-4 px-6">株式会社ListenMate</td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold w-1/3 bg-gray-50">
                代表者名
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
              <td className="py-4 px-6">
                03-1234-5678（受付時間：平日10:00〜17:00）
              </td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                メールアドレス
              </th>
              <td className="py-4 px-6">info@listenmate.example.com</td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                サービス料金
              </th>
              <td className="py-4 px-6">
                <p className="mb-2">基本プラン：月額1,980円（税込）</p>
                <p>プレミアムプラン：月額3,980円（税込）</p>
              </td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                支払方法
              </th>
              <td className="py-4 px-6">
                <p>
                  クレジットカード決済（VISA、Mastercard、JCB、American
                  Express）
                </p>
              </td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                支払時期
              </th>
              <td className="py-4 px-6">
                <p>ご利用開始日に初回決済、以降は毎月同日に決済</p>
              </td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                サービス提供時期
              </th>
              <td className="py-4 px-6">
                <p>お申し込み完了後、すぐにご利用いただけます</p>
              </td>
            </tr>
            <tr className="border-b">
              <th className="py-4 px-6 text-left font-semibold bg-gray-50">
                キャンセル・返品
              </th>
              <td className="py-4 px-6">
                <p className="mb-2">
                  ご利用開始後14日以内であれば、全額返金いたします。
                </p>
                <p>
                  14日を経過した後は、契約期間の満了をもって終了となり、途中解約による返金はいたしかねます。
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <section>
          <h2 className="text-xl font-semibold mb-4">その他特記事項</h2>
          <p className="mb-4">
            当サービスは、インターネット接続環境が必要です。通信料はお客様のご負担となります。
          </p>
          <p>
            サービスの詳細な利用条件については、「利用規約」をご確認ください。
          </p>
        </section>
      </div>
    </PageLayout>
  );
};

export default LegalPage;
