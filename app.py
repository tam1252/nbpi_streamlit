import pandas as pd
import streamlit as st
import numpy as np
import math

st.title("NBPIを計算するアプリ")
bpi_file = st.file_uploader("BPIManagerからエクスポートしたCSVをアップロードしてください")
st.info("BPIManagerの設定>その他>エクスポートで保存したCSVをアップロードして下さい")
def diff_to_name(row):
    diff = row["難易度"]
    title = row["楽曲名"]
    if diff == "HYPER":
        return title + "(H)"
    elif diff == "ANOTHER":
        return title + "(A)"
    else:
        return title + "(L)"

def culc_total_bpi(l):
    n = len(l)
    k = math.log2(n)
    print(l)
    tmp = sum([i**k for i in l]) / n
    return tmp**(1/k)
    
    
if bpi_file is not None:
    df = pd.read_csv(bpi_file)
    df = df[["楽曲名", "難易度", "BPI"]].sort_values(by="BPI", ascending=False).replace([np.inf, -np.inf], np.nan).dropna()
    df["楽曲名"] = df.apply(diff_to_name, axis=1)
    df = df.drop("難易度", axis=1)
    song_count = st.slider("計算する曲数を選んでください(10～100, 10刻み)", 10, 100, 20, 10)
    hbpi = culc_total_bpi(df["BPI"].head(song_count).to_list())
    st.markdown(f"あなたの{song_count}曲のHBPIは**{round(hbpi, 2)}**です。")
    st.markdown("## 一覧")
    st.write(df.head(song_count))
    
    st.download_button(
    label="CSVにエクスポート",
    data=df.head(song_count).to_csv().encode("shift_jis"),
    file_name='hbpi.csv',
    mime='text/csv',
    )
    