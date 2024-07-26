"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "~/app/_components/Button";

export default function SpecifiedCommercialTransactionAct() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <p className="pb-4 text-sm opacity-70">
        What is this? These are details mandated by Japanese Law to be published
        for Japanese consumers.
      </p>
      <h1 className="pb-8 text-3xl font-bold">特定商取引法に基づく表記</h1>
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)}>内容を表示する</Button>
      ) : (
        <div className="rounded bg-white/50 p-8 dark:bg-white/10">
          <table>
            <thead>
              <tr>
                <th>
                  <div className="flex w-full flex-row items-start">項目</div>
                </th>
                <th>
                  <div className="flex w-full flex-row items-start">内容</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>販売業社の名称</td>
                <td>お問い合わせください。</td>
              </tr>
              <tr>
                <td>所在地</td>
                <td>お問い合わせください。</td>
              </tr>
              <tr>
                <td>電話番号</td>
                <td>
                  お問い合わせください。
                  {/* <br /> */}
                  {/* 受付時間 10:00-18:00（土日祝を除く） */}
                </td>
              </tr>
              <tr>
                <td>メールアドレス</td>
                <td>contact@skydiary.app</td>
              </tr>
              <tr>
                <td>運営統括責任者</td>
                <td>お問い合わせください。</td>
              </tr>
              <tr>
                <td>追加手数料等の追加料金</td>
                <td>該当なし</td>
              </tr>
              <tr>
                <td>交換および返品（返金ポリシー）</td>
                <td>
                  ウェブサイトのキャンセルボタンを押すことで注文のキャンセルが可能です。
                  <br />
                  いかなる状況においても返金はありません。キャンセルすると、現在の支払い期間が終了するまでサービスを利用できますが、その後は自動更新されません。
                </td>
              </tr>
              <tr>
                <td>引渡時期</td>
                <td>
                  支払い後、サブスクリプションは通常すぐに、最大でも数分以内に有効になります。
                </td>
              </tr>
              <tr>
                <td>受け付け可能な決済手段</td>
                <td>クレジットカードのみ</td>
              </tr>
              <tr>
                <td>決済期間</td>
                <td>クレジットカード決済の場合はただちに処理されます。</td>
              </tr>
              <tr>
                <td>販売価格</td>
                <td>
                  <a href="/pricing">pricing ページ</a>に記載の金額
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-8">
            <Link href="/contact">
              <Button>お問い合わせ</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
